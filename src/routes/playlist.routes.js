import {verifyJWT} from "../middlewares/auth.middleware.js"
import { Router } from "express";
const playlistRouter = Router();

playlistRouter.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

playlistRouter.route("/").post(createPlaylist)

playlistRouter
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

playlistRouter.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
playlistRouter.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

playlistRouter.route("/user/:userId").get(getUserPlaylists);

export default playlistRouter;