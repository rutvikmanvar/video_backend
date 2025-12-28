import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscribe: {
        type: mongoose.Schema.Types.ObjectId, //one who subscribed
        ref: 'User'
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, //one to whome 'subscriber' is subscribing
        ref: 'User'
    }
},
{
    timestamps:true    
})

export const Subscription = mongoose.model('Subscription',subscriptionSchema)