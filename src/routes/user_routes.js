import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refereshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user_controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:'coverImage',
            maxCount:1 
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWT,logoutUser)

router.route('/refereshToken').post(refereshAccessToken)

router.route('/reset-password').post(verifyJWT,changeCurrentPassword)

router.route('/get-user').get(verifyJWT,getCurrentUser)

router.route('/update-account').post(verifyJWT,updateAccountDetails)

router.route('/update-avatar').post(verifyJWT,upload.single('avatar'),updateUserAvatar)

router.route('/update-coverImage').post(verifyJWT,upload.single('coverImage'),updateUserCoverImage)

router.route('/get-channel/:username').get(verifyJWT,getUserChannelProfile)

router.route('/get-watch-history').get(verifyJWT,getWatchHistory)


export default router;  