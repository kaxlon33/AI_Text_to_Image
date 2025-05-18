import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true , "User Name is required"],
        trim: true,
        minLength : [3 , "User Name must be at least 3 characters"],
        maxLength : [20 , "User Name must be at most 20 characters"]
    },
    email : {
        type: String,
        required: [true , 'User Email is required'],
        unique : true,
        trim: true,
        lowercase: true,
        match : [/\S+@\S+\.\S+/ , 'Please fill a valid email address']
    },
    password : {
        type: String,
        required: [true , 'User Password is required'],
        minLength : [8 , "User Password must be at least 8 characters"],
        select : false
    },
    creditBalance : {
        type : Number,
        default : 5
    }
},{timestamps : true})

const userModel = mongoose.models.user || mongoose.model('User' , userSchema)

export default userModel