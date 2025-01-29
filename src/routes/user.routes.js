import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.route("/current-user").get(verifyJwt, userController.getCurrentUser);

userRouter
  .route("/update-account")
  .patch(verifyJwt, userController.updateUserDetails);

userRouter
  .route("/change-password")
  .patch(verifyJwt, userController.changeCurrentPassword);

userRouter
  .route("/avatar")
  .patch(verifyJwt, upload.single("avatar"), userController.updateAvatar);

userRouter
  .route("/cover-image")
  .patch(
    verifyJwt,
    upload.single("coverImage"),
    userController.updateCoverImage
  );

userRouter
  .route("/c/:username")
  .get(verifyJwt, userController.getUserChannelProfile);

userRouter.route("/history").get(verifyJwt, userController.getWatchHistory);

export default userRouter;
