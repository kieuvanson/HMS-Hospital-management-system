import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase:true,
    },
    hashpassword:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
        trim: true,
    },
    avatarUrl:{
        type:String,
    },
    cccd: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    gender: {
        type: String,
        enum: ['Nam', 'Nữ', 'Khác'],
        default: 'Khác'
    },
    age: {
        type: Number,
        min: 18,
        max: 100
    },
    address: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date
    },
    phone:{
        type:String,
        sparse:true,//Cho phép giá trị null trong trường unique

    },
    department: {
        type: String,
        trim: true
    },
    timestramp:{
        type:Date,
        default:Date.now,
    },
    role:{
        type:String,
        enum: ['Admin', 'doctor', 'patients', 'Nurse'],
        default: 'patients',
    }

});
userSchema.index({email:1},{unique:true});
userSchema.index({phone:1},{sparse:true,unique:true});
userSchema.index({name:1});
const User = mongoose.model('User',userSchema)
export default User;

