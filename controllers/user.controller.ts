import type { NextFunction, Request, Response } from "express";
import UserAccount from "../modals/UserAccount";
import ApiError from "../errors/api.error";

const fetchPersonalData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await UserAccount.findById(userId).select("-password");
    if (!user) {
      throw new ApiError("Invalid user token", 401);
    }
    res.status(200).json({
      success: true,
      user,
    });
    return;
  } catch (err) {
    next(err);
  }
};

const updatePersonalData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new ApiError("Unauthorized request", 401);
    }
    const allowedFields = [
      "username",
      "department",
      "skills",
      "linkedinUrl",
      "githubUrl",
      "description",
      "isAvailable",
    ];
    const normalizedData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (typeof req.body[field] === "string") {
        normalizedData[field] = req.body[field].trim();
      } else if (req.body[field] !== undefined) {
        normalizedData[field] = req.body[field];
      }
    }
    if (Object.keys(normalizedData).length === 0) {
      throw new ApiError("No valid fields to update", 400);
    }
    const updatedUser = await UserAccount.findByIdAndUpdate(
      userId,
      {
        $set: normalizedData,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(
      "username department skills linkedinUrl githubUrl description isAvailable profilePicture resumeUrl"
    );
    if (!updatedUser) {
      throw new ApiError("No user found", 404);
    }
    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};



export {
  fetchPersonalData,
  updatePersonalData,
};
