import {Router} from 'express'
import {verifyJWT} from '../middlewares/auth_middleware.js'
import { addComment, deleteComment, getComment, updateComment } from '../controllers/comment_controller.js';

const router = Router();

router.use(verifyJWT);

router.route('/add').post(addComment)

router.route('/get/:videoId').get(getComment)

router.route('/update').patch(updateComment)

router.route('/delete').post(deleteComment)

export default router;