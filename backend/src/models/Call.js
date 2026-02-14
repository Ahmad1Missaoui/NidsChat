import mongoose from "mongoose";

const callSchema = new mongoose.Schema({
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    callType: {
        type: String,
        enum: ["voice", "video"],
        required: true
    },
    status: {
        type: String,
        enum: ["missed", "answered", "rejected", "cancelled"],
        required: true
    },
    duration: {
        type: Number, // Duration in seconds
        default: 0
    },
    startedAt: {
        type: Date,
        default: null
    },
    endedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Index for faster queries
callSchema.index({ caller: 1, createdAt: -1 });
callSchema.index({ receiver: 1, createdAt: -1 });

const Call = mongoose.model("Call", callSchema);

export default Call;
