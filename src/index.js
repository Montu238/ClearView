import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import { app } from "./app.js";


connectDB();
app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
