import {verifyJwt} from "../middlewares/auth.middleware.js"
import { Router } from "express";
import { playListController } from "../controllers/playlist.controller.js"
const playlistRouter = Router();

playlistRouter.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

playlistRouter.route("/").post(playListController.createPlaylist)

playlistRouter
    .route("/:playlistId")
    .get(playListController.getPlaylistById)
    .patch(playListController.updatePlaylist)
    .delete(playListController.deletePlaylist);

playlistRouter.route("/add/:videoId/:playlistId").patch(playListController.addVideoToPlaylist);
playlistRouter.route("/remove/:videoId/:playlistId").patch(playListController.removeVideoFromPlaylist);

playlistRouter.route("/user/:userId").get(playListController.getUserPlaylists);

export default playlistRouter;