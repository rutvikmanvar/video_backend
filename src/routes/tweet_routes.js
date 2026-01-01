import { Router } from "express";
import { createTweet, deleteTweet, getUserTweet, updateTweet } from '../controllers/tweet_controller.js'
import { verifyJWT } from "../middlewares/auth_middleware.js";

const router = Router();

router.use(verifyJWT);

router.route('/create').post(createTweet)
router.route('/get-tweet').get(getUserTweet)
router.route('/update').patch(updateTweet)
router.route('/delete').post(deleteTweet)

export default router;