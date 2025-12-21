import { Request, Response } from "express";
import imagekit from "../configs/imagekit";
import UserAccount from "../modals/UserAccount";
import ApiError from "../errors/api.error";

const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    const userId = req.userId;

    if (!image) {
      throw new ApiError("Image required", 400);
    }

    const existingUser = await UserAccount.findById(userId).select(
      "profileFileId"
    );

    if (!existingUser) {
      throw new ApiError("User Not Found", 404);
    }
    if (
      typeof existingUser.profileFileId === "string" &&
      existingUser.profileFileId.trim() !== ""
    ) {
      try {
        await imagekit.deleteFile(existingUser.profileFileId);
      } catch (err) {
        console.warn(
          "[AVATAR DELETE WARNING]: Failed to delete old avatar",
          err
        );
      }
    }

    const uploadResult = await imagekit.upload({
      file: image,
      fileName: `avatar-${userId}-${Date.now()}.webp`,
      folder: "/avatars",
      transformation: {
        pre: "w-256,h-256,c-fill,q-80,f-webp",
      },
    });

    const updatedUser = await UserAccount.findOneAndUpdate(
      { _id: userId },
      {
        profileUrl: uploadResult.url,
        profileFileId: uploadResult.fileId,
      },
      { new: true }
    ).select("profileUrl");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      profileUrl: uploadResult.url,
    });
  } catch (err: unknown) {
    console.log("[AVATAR UPLOAD ERROR] :", err);
    throw new ApiError("Failed to upload avatar", 400);
  }
};

export { uploadAvatar };
