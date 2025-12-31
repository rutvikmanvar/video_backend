import {Router} from 'express';
import {getAllVideo, publishVideo,getVideoById, deleteVideo, publishToggle, updateVideo} from '../controllers/video_controller.js'; 
import {upload} from '../middlewares/multer_middleware.js';
import {verifyJWT} from '../middlewares/auth_middleware.js';

const router = Router();

router.route('/publish-video').post(
    verifyJWT,
    upload.fields([
        {
            name:'video',
            maxCount:1
        },
        {
            name:'thumbnail',
            maxCount:1
        }
    ]),
    publishVideo
)

router.route('/get-all-video').get(getAllVideo)

router.route('/get-video/:id').get(getVideoById)

router.route('/delete-video/:id').delete(verifyJWT,deleteVideo)

router.route('/publish-toggle').post(verifyJWT,publishToggle)

router.route('/update-video').patch(verifyJWT,upload.single('thumbnail'),updateVideo)


export default router