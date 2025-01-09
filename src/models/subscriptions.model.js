import mongoose from 'mongoose';

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

export const Subscription = mongoose.model('Subscription', subscriptionSchema);