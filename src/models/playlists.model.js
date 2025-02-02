import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const playlistSchema = new mongoose.Schema(
      {
            name:{
                  type:String,
                  required:true
            },
            description:String,
            videos:[{
                  type:mongoose.Schema.Types.ObjectId,
                  ref:'Video'
            }],
            owner:{
                  type:mongoose.Schema.Types.ObjectId,
                  ref:'User '
            }
      },{timestamps:true});

playlistSchema.plugin(mongooseAggregatePaginate);
const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;