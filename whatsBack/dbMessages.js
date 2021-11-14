import mongoose from "mongoose";

const whatssappSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received: Boolean,
});

export default mongoose.model("messagecontents", whatssappSchema);
