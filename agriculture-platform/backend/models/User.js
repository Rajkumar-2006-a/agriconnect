import mongoose from 'mongoose'; import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},phone:{type:String,required:true,trim:true},password:{type:String,required:true,select:false},role:{type:String,enum:['farmer','buyer','rentalOwner','admin'],default:'buyer'},location:{type:String,trim:true,default:''},profileImage:String},{timestamps:true});
userSchema.pre('save',async function(next){if(!this.isModified('password'))return next();this.password=await bcrypt.hash(this.password,12);next();}); userSchema.methods.comparePassword=function(p){return bcrypt.compare(p,this.password);}; export default mongoose.model('User',userSchema);

