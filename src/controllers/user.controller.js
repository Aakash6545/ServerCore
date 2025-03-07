import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { log } from "console";

const generateAccessAndRefreshToken = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(
        500,
        "User not found while generating Access and Refresh Token."
      );
    }
    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);

    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Token."
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, fullName, password } = req.body;

  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const [existingEmail, existingUsername] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ username }),
  ]);
  if (existingEmail && existingUsername) {
    throw new ApiError(409, "Username and Email already exist");
  }
  if (existingEmail) {
    throw new ApiError(409, "Email already exists");
  }

  if (existingUsername) {
    throw new ApiError(409, "Username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(409, "Avatar File is Needed");
  }

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar image is needed");
  }
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.secure_url,
    avatarPublicId: avatar.public_id,
    coverImage: coverImage?.secure_url || "",
    coverImagePublicId: coverImage?.public_id || "",
  });

  const createdUser = await User.findById(user._id)?.select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Error while registering User");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get data from frontend
  //validate data
  //check weather a user for the given credentials is present or not
  // find user
  //check password
  // if pss correct generate access and refresh token  for the user
  // set cookies as access token and refresh token
  // return the user
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(404, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User do not exist.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Creadentials.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        202,
        {
          loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In successfully."
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // find user by req.user._id and replace (unset refreshToken) new: true
  //  clear the cookie and send response

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(201, "User Logged Out successfully."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refreashToken from cookies or request body
  //if not found , error
  //decode the token
  //validate user
  //check if the incoming refresh token is eqaul to the one stored in database
  //renew the access and refresh token and save the user
  //return access and refresh token

  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      throw new ApiError(402, "Unauthorized Request. No Token is Found.");
    }
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid Token.");
    }

    if (refreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token expired or used.");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          201,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access and Refresh Token refreshed successfully."
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while refreshing the Access Token and Refresh Token."
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword)) {
      throw new ApiError(401, "All fields are required.");
    }

    const user = await User.findById(req.user._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Password is incorrect");
    }

    user.password = newPassword;
    user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(201, "password updated successfully."));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error);
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(201, req.user, "User deatials fetched successfully.")
    );
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(email && fullName)) {
    throw new ApiError(401, "email and fullName is required.");
  }

  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        email,
        fullName,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");
  return res.status(200).json(201, user, "User details updated successfully.");
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar is required.");
  }

  await deleteFromCloudinary(req.user?.avatarPublicId);

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(
      500,
      "Something went wrong while uploading avatar on cloudinary."
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.secure_url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(201, user, "Avatar updated successfully."));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  console.log(req.file);
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(401, "coverImage is required.");
  }
  if (req.user?.coverImagePublicId) {
    await deleteFromCloudinary(req.user?.coverImagePublicId);
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage) {
    throw new ApiError(
      500,
      "Something went wrong while uploading coverImage on cloudinary."
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.secure_url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(201, user, "coverImage updated successfully."));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
