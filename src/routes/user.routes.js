import { Router } from "express";
import { register, loginUser, logoutUser,refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(
      upload.fields([
            { name: "avatar", maxCount: 1 },      // Field name 'avatar', allow 1 file
            { name: "coverImage", maxCount: 1 }, // Field name 'coverImage', allow 1 file
      ]),
      register);

userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJwt,logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);

export default userRouter;