import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();


userRouter.route("/register").post(
      upload.fields([
            { name: "avatar", maxCount: 1 },      // Field name 'avatar', allow 1 file
            { name: "coverImage", maxCount: 1 }, // Field name 'coverImage', allow 1 file
      ]),
      userController.register); //tested
      
userRouter.route("/current-user").get(verifyJwt,userController.getCurrentUser); //tested

userRouter.route("/login").post(userController.loginUser); //tested

userRouter.route("/logout").post(verifyJwt,userController.logoutUser); //tested

userRouter.route("/refresh-token").post(userController.refreshAccessToken); //tested

userRouter.route("/update").patch(verifyJwt,userController.updateUserDetails); //tested

userRouter.route("/update/password").patch(verifyJwt,userController.changeCurrentPassword); //tested

userRouter.route("/update/avatar").patch(verifyJwt,upload.single("avatar"),userController.updateAvatar); //tested

userRouter.route("/update/cover-image").patch(verifyJwt,upload.single("coverImage"),userController.updateCoverImage); //tested 



export default userRouter;