import { Router } from "express";
import {verifyJwt} from "../middlewares/auth.middleware.js";
const subscriptionRouter = Router();

subscriptionRouter.use(verifyJwt);

subscriptionRouter
.route("/c/:channleId")
.get(getSubscribedChannels)
.post(toggleSubscription);

subscriptionRouter.route("/u/:subscriberId").get(getUserChannelSubscribers);
export default subscriptionRouter;