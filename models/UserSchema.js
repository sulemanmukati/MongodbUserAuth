import mongoose from "mongoose";

const Schema = mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    password:String
})

const userModels = mongoose.model('user',Schema)
export default userModels