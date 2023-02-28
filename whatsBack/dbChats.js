import mongoose from 'mongoose';

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    lastMessage: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('chat', chatSchema);
