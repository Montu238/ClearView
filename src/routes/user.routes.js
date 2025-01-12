import { Router } from "express";
import { register } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import multer from "multer";
const userRouter= Router();

userRouter.route("/register").post(
      upload.fields([
            { name: "avatar", maxCount: 1 },      // Field name 'avatar', allow 1 file
            { name: "coverImage", maxCount: 1 }, // Field name 'coverImage', allow 1 file
          ]),
      register)
export default userRouter;