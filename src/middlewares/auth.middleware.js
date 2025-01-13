import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../models/user.model";
import ApiError from "../utils/ApiError";

export default verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cokkies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(402, "Unauthorized Request.");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Token.");
    }
  
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something went wrong while verifying Token.")
  }
});
