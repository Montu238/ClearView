import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const commentSchema = new mongoose.Schema(
      {
          content:{
            type:String,
            required:[true,"Content is required!"]
          },
          video:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Video',
            required:[true,"Video is required!"]
          },
          commentedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User ',
            required:[true,"Commented by is required!"]
          }
      },{timestamps:true});

commentSchema.plugin(mongooseAggregatePaginate);
const Comment = mongoose.model('Comment', commentSchema);

export default Comment;