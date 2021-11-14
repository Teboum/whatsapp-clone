import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {type:String,require:true},
  phone: {type:String,require:true,unique:true},
  date: {type:String,require:true},
  picture: {type:String,require:true},
  status:{type:Boolean,default:false}
});

export default mongoose.model("user", userSchema);
