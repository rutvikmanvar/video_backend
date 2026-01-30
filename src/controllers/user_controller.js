import { asyncHandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_error.js";
import { uploadOnCloudinary } from "../utils/clouldinary.js";
import { User } from "../models/user_model_temp.js";
import { ApiResponse } from "../utils/api_response.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefereshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log(`user access :`, user);
    const access = user.generateAccessToken();
    console.log(`access :`, access);
    const referesh = user.generateRefereshToken();
    console.log(`referesh :`, referesh);
    user.refreshToken = referesh;

    await user.save({ validateBeforeSave: false });

    return { access, referesh };
  } catch (error) {
    console.log(`original error : ${error.message}`);
    throw new ApiError(
      500,
      "Something happen while generating access and referesh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "This field is required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log("existeduser : ", existedUser);

  if (existedUser) {
    throw new ApiError(
      409,
      "User with this email or username is already exist"
    );
  }

  const avatarLocalParh = req.files?.avatar[0]?.path;
  let coverImageLocalPath = "";

  if (!avatarLocalParh) {
    throw new ApiError(400, "Avtar file is required");
  }

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  console.log(`coverImagePath : `, req.files);

  const avatar = await uploadOnCloudinary(avatarLocalParh);

  const cover =
    coverImageLocalPath != undefined ||
    coverImageLocalPath != null ||
    coverImageLocalPath != ""
      ? await uploadOnCloudinary(coverImageLocalPath)
      : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed - check server logs");
  }

  console.log(`cover.url : ${cover?.url}`);

  const user = await User.create({
    fullName,
    email,
    username: username,
    password: password,
    avatar: avatar.url,
    coverImage: cover?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log(`user : `, user);

  if (!user) {
    throw new ApiError(400, "User not Exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Password is incorrect");
  }

  const { access, referesh } = await generateAccessAndRefereshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", access, option)
    .cookie("refreshToken", referesh, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          access,
          referesh,
        },
        "Login success"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const user = await User.findByIdAndUpdate(
    id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  console.log(`after logout : ${user}`);

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, "Logout Success"));
});

const refereshAccessToken = asyncHandler(async (req, res) => {
  const cookieToken =
    req.cookies.refreshToken && req.cookies.refreshToken !== "undefined"
      ? req.cookies.refreshToken
      : null;

  const inCommingRefershToken = cookieToken || req.body.refreshToken;
  console.log(`inCommingRefereshToken before :`, inCommingRefershToken);
  console.log(`req.body.refreshToken :`, req.body.refreshToken);

  if (
    !inCommingRefershToken ||
    inCommingRefershToken === "undefined" ||
    inCommingRefershToken === "null"
  ) {
    throw new ApiError(401, "Unauthorized request");
  }

  console.log(`inCommingRefereshToken : `, inCommingRefershToken);

  try {
    const decodedToken = jwt.verify(
      inCommingRefershToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    console.log(`decoded Token : `, decodedToken);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid referesh token");
    }

    if (inCommingRefershToken != user?.refreshToken) {
      throw new ApiError(401, "Referesh token expired or invalid");
    }

    const option = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Token generated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if ([oldPassword, newPassword].some((field) => field?.trim() === "")) {
    throw new ApiError(401, "This field is required");
  }

  const userId = req.user._id;
  const user = await User.findById(userId);

  console.log(`oldPassword :`, oldPassword);
  console.log(`newPassword :`, newPassword);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  console.log(`isPasswordValid :`, isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password not match");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "null", "Password updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetch succesfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username, email } = req.body;

  if (!fullName || !email || !username) {
    throw new ApiError(401, "This field is required");
  }

  const userId = req.user._id;

  const alreadyTaken = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (alreadyTaken) {
    throw new ApiError(401, "User already exist with this username or email");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        fullName: fullName,
        email: email,
        username: username,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const localPath = req.file?.path;

  console.log(`localPath : `, localPath);

  if (!localPath) {
    throw new ApiError(401, "LocalPath not provided");
  }

  const avatar = await uploadOnCloudinary(localPath);

  if (!avatar.url) {
    throw new ApiError(401, "Error while upoading on server");
  }

  const userId = req.user._id;
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const localPath = req.file?.path;

  console.log(`localPath : `, localPath);

  if (!localPath) {
    throw new ApiError(401, "LocalPath not provided");
  }

  const cover = await uploadOnCloudinary(localPath);

  if (!cover.url) {
    throw new ApiError(401, "Error while upoading on server");
  }

  const userId = req.user._id;
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        coverImage: cover.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Imagei updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params;

    console.log('username = ',username)

    if(!username?.trim()){
        throw new ApiError(400,'Chanel not found')
    }

    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase() 
            }
        },
        {
            $lookup:{
                from:'subscriptions',
                localField:'_id',
                foreignField:'channel',
                as:'subscribers'
            }
        },
        {
            $lookup:{
                from:'subscriptions',
                localField:'_id',
                foreignField:'subscribe',
                as:'subscribedTo'
            }
        },
        {
            $addFields:{
                subscribersCount: {
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{
                            $in:[
                                req.user?._id,
                                "$subscribers.subscriber"
                            ]
                        },
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    if(!channel?.length) {
        throw new ApiError(400,'channel not exist')
    }

    console.log(`channel value : ${JSON.stringify(channel)}`)

    return res.status(200).json(
        new ApiResponse(200,channel[0],'Channel data fetched successfully')
    )

});
  



const getWatchHistory = asyncHandler(async(req,res) => {
  console.log(`ID : ${req.user._id}`);
  const user = await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:'videos',
        localField:'watchHistory',
        foreignField:'_id',
        as:'watchHistory',
        pipeline:[
          {
            $lookup:{
              from:'users',
              localField:'owner',
              foreignField:'_id',
              as:'owner',
              pipeline:[
                {
                  $project:{
                    fullName:1, 
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first:'$owner'
              }
            }
          }
        ],
      }
    }
  ])

  return res.status(200).json(
    new ApiResponse(200,user[0].watchHistory,'Watch history details')
  )
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refereshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
