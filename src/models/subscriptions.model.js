import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const subscriptionSchema = new mongoose.Schema(
      {
            subscriber:{  //user who is subscribing
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'User',
            },
            channel:{  //one whom the subscriber is subscribing 
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'Channel',
            }
      },{timestamps:true});
subscriptionSchema.plugin(mongooseAggregatePaginate);
export const Subscription = mongoose.model('Subscription', subscriptionSchema);