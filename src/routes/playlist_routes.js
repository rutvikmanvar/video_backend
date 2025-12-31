import { Router } from "express";
import { verifyJWT } from "../middlewares/auth_middleware.js";
import { addVideo, createPlaylist, deletePlaylist, getUserPlaylist, getUserPlaylistById, removeVideo, updatePlaylist } from '../controllers/playlist_controller.js'

const router = Router();

router.route('/create').post(verifyJWT,createPlaylist);

router.route('/user-playlist').post(getUserPlaylist)

router.route('/playlist/:_id').get(getUserPlaylistById)

router.route('/delete').delete(verifyJWT,deletePlaylist)

router.route('/update').patch(verifyJWT,updatePlaylist)

router.route('/add-video').post(verifyJWT,addVideo)

router.route('/remove-video').post(verifyJWT,removeVideo)

export default router;