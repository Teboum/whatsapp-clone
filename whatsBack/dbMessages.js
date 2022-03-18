import mongoose from "mongoose";

var limit;
const whatssappSchema = mongoose.Schema(
  {
    messages: {
      type: [
        {
          type: new mongoose.Schema(
            {
              message: String,
              sender: String,
            },
            { timestamps: true }
          ),
        },
      ],
      default: [],
      require: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    lastMessage: { type: String, default: "" },
  },
  { timestamps: true, new: true }
);

export default mongoose.model("message", whatssappSchema);
