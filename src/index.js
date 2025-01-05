import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import connectDB from "./db/index.js";
const app = express();

connectDB();
app.listen(process.env.PORT,()=>{
      console.log(`listening on port ${process.env.PORT}`);
  });