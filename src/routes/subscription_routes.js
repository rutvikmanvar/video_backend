import { Router } from "express";
import { getFollowers, getFollowersDetails, getFollowing, getFollowingDetails, toggleFollow } from "../controllers/subscription_controller.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";

const router = Router();

router.use(verifyJWT)

router.route('/follow').post(toggleFollow)

router.route('/get-following').post(getFollowing)

router.route('/get-followers').post(getFollowers)

router.route('/get-following-detail').post(getFollowingDetails)

router.route('/get-followers-detail').post(getFollowersDetails)

export default router;