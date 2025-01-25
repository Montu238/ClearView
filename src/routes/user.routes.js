import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();


/*userRouter.route("/register").post(
      upload.fields([
            { name: "avatar", maxCount: 1 },      // Field name 'avatar', allow 1 file
            { name: "coverImage", maxCount: 1 }, // Field name 'coverImage', allow 1 file
      ]),
      userController.register); 
      
      
      userRouter.route("/login").post(userController.loginUser); 
      
      userRouter.route("/logout").post(verifyJwt,userController.logoutUser); 
      
      userRouter.route("/refresh-token").post(userController.refreshAccessToken); */  


userRouter.route("/current-user").get(verifyJwt,userController.getCurrentUser);
 
userRouter.route("/update").patch(verifyJwt,userController.updateUserDetails); 

userRouter.route("/update/password").patch(verifyJwt,userController.changeCurrentPassword); 

userRouter.route("/update/avatar").patch(verifyJwt,upload.single("avatar"),userController.updateAvatar); 

userRouter.route("/update/cover-image").patch(verifyJwt,upload.single("coverImage"),userController.updateCoverImage);  



export default userRouter;