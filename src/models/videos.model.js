import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User ",
      required: [true, "Owner is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    videoFile: {
      type: String,
      required: [true, "Video file is required"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true,
    versionKey: false 
   }
);
videoSchema.index({ title: 'text', description: 'text' });
videoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model("Video", videoSchema);

export default Video;