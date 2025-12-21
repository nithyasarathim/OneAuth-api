import { Request, Response } from "express";
import imagekit from "../configs/imagekit";
import UserAccount from "../modals/UserAccount";
import ApiError from "../errors/api.error";

const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    const userId = req.userId;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image required",
      });
    }

    const uploadResult = await imagekit.upload({
      file: image,
      fileName: `avatar-${userId}-${Date.now()}.webp`,
      folder: "/avatars",
      transformation: {
        pre: "w-256,h-256,c-fill,q-auto,f-webp",
      },
    });

    const updatedUser = await UserAccount.findOneAndUpdate(
      { _id: userId },
      { profileUrl: uploadResult.url },
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
  } catch (err:unknown) {
      console.log("[AVATAR UPLOAD ERROR] :", err.message);
      throw new ApiError("Failed to upload avatar", 400);
  }
};

export {
    uploadAvatar
}
