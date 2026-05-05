import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.route("/user/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);

// Protected
router.route("/").post(verifyJwt, createPlaylist);
router.route("/:playlistId").patch(verifyJwt, updatePlaylist);
router.route("/:playlistId").delete(verifyJwt, deletePlaylist);
router.route("/add/:videoId/:playlistId").patch(verifyJwt, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyJwt, removeVideoFromPlaylist);

export default router;
