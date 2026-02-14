import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
    },
    document: {
      type: String,
    },
    documentName: {
      type: String,
    },
    video: {
      type: String,
    },
    voice: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ['text', 'image', 'document', 'video', 'voice'],
      default: 'text',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String, required: true },
      },
    ],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    missedCall: {
      type: Boolean,
      default: false,
    },
    callType: {
      type: String,
      enum: ['voice', 'video'],
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;