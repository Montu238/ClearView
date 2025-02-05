import { Router } from "express";
import {verifyJwt} from "../middlewares/auth.middleware.js";
import {subscriptionController} from "../controllers/subscription.controller.js";
const subscriptionRouter = Router();

subscriptionRouter.use(verifyJwt);

subscriptionRouter
.route("/c/:channelId")
.get(subscriptionController.getUserChannelSubscribers)
.post(subscriptionController.toggleSubscription);

subscriptionRouter.route("/u/:subscriberId").get(subscriptionController.getSubscribedChannels);
export default subscriptionRouter;