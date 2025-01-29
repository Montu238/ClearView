import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authController } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 }, // Field name 'avatar', allow 1 file
    { name: "coverImage", maxCount: 1 }, // Field name 'coverImage', allow 1 file
  ]),
  authController.register
);

authRouter.route("/login").post(authController.loginUser);

authRouter.route("/logout").post(verifyJwt, authController.logoutUser);

authRouter.route("/refresh-token").post(authController.refreshAccessToken);

export default authRouter;
