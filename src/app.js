import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { SERVER_ADDRESS } from "./constants.js";
const app = express();

app.use(
  express.json({
    limit: "20kb",
    type: "application/json",
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.static("public"));
app.use(cookieParser());

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";

app.use(`${SERVER_ADDRESS}/auth`, authRouter);
app.use(`${SERVER_ADDRESS}/users`, userRouter);
app.use(`${SERVER_ADDRESS}/videos`, videoRouter);

export { app };
