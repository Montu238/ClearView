import { Router } from 'express';
import { commentController } from "../controllers/comment.controller.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"

const commentRouter = Router();

commentRouter.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

commentRouter.route("/:videoId").get(commentController.getVideoComments).post(commentController.addComment);
commentRouter.route("/c/:commentId").delete(commentController.deleteComment).patch(commentController.updateComment);

export default commentRouter;