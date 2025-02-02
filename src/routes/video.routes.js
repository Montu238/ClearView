import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { videoController } from "../controllers/video.controller.js";
const videoRouter = Router();

videoRouter.use(verifyJwt);

videoRouter.route("/").get(videoController.getAllVideos);

videoRouter.route("/upload").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  videoController.postVideo
);
videoRouter
  .route("/:videoId")
  .get(videoController.getVideoById)
  .delete(videoController.deleteVideo)
  .patch(upload.single("thumbnail"), videoController.updateVideo);

videoRouter
  .route("/toggle/publish/:videoId")
  .patch(videoController.togglePublishStatus);

export default videoRouter;
