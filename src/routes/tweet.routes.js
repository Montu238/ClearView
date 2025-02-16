import { Router } from 'express';
import { tweetController } from "../controllers/tweet.controller.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"

const tweetRouter = Router();
tweetRouter.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

tweetRouter.route("/").post(tweetController.createTweet);
tweetRouter.route("/user/:userId").get(tweetController.getUserTweets);
tweetRouter.route("/:tweetId").patch(tweetController.updateTweet).delete(tweetController.deleteTweet);

export default tweetRouter;