import mongoose from "mongoose";



const userSchema=new mongoose.Schema({

email:{
   type: String,
   required: true,
   unique: true,   

},
   username:{
     type:String,
     required:true,
     unique:true,
     trim:true,
     lowercase:true,
     minlength:3,
     maxlength:30,
     match: /^[a-z0-9_]+$/ // Only lowercase letters, numbers, and underscores
   },
   fullName:{
     type:String,
     required:true,
   },
   password:{
        type:String,
        required:function() {
          return !this.googleId; // Password not required for Google OAuth users
        },
        minlength:6


   },
   profilePic:{
        type:String,
        default:""
   },
   bio:{
        type:String,
        default:"",
        maxlength:200
   },
   gender:{
        type:String,
        enum:["male", "female", "other"],
        default:""
   },
   birthday:{
        type:Date,
        default:null
   },
   country:{
        type:String,
        default:""
   },
   googleId:{
        type:String,
        unique:true,
        sparse:true // Allows null values while maintaining uniqueness
   },
   // Friend System
   friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[]
   }],
   friendRequestsSent:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[]
   }],
   friendRequestsReceived:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[]
   }],
   blockedUsers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[]
   }],
   // Privacy Settings
   privacySettings:{
        canBeAddedBy:{
          type:String,
          enum:["everyone", "friends_of_friends", "nobody"],
          default:"everyone"
        },
        showOnlineStatus:{
          type:Boolean,
          default:true
        }
   },
   // Groups
   groups:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group",
        default:[]
   }],
   // Online Status
   isOnline:{
        type:Boolean,
        default:false
   },
   lastSeen:{
        type:Date,
        default:Date.now
   },
   // Email Verification
   isEmailVerified:{
        type:Boolean,
        default:false
   },
   emailVerificationToken:{
        type:String,
        default:null
   },
   emailVerificationExpires:{
        type:Date,
        default:null
   }
},

{timestamps:true});

const User=mongoose.model("User",userSchema);

export default User;
