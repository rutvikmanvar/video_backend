import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth_middleware.js';
import { getLikedVideo, toggleComentLike, toggleTweetLike, toggleVideoLike } from '../controllers/like_controller.js';

const router = Router();

router.use(verifyJWT);

router.route('/video').post(toggleVideoLike)
router.route('/comment').post(toggleComentLike)
router.route('/tweet').post(toggleTweetLike)
router.route('/liked-video').get(getLikedVideo)

export default router;