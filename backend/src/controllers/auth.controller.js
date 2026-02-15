import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken, generateVerificationToken } from "../lib/utils.js";
import { sendWelcomeEmail, sendVerificationEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req,res) => {
    const {fullName,email,username,password,gender,birthday,country} = req.body 

    try{
        const normalizedEmail = (email || "").trim().toLowerCase();
        const normalizedUsername = (username || "").trim().toLowerCase();
        const normalizedFullName = (fullName || "").trim();

        if(!normalizedFullName || !normalizedEmail || !normalizedUsername || !password){
            return res.status(400).json({message:"All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters"});
        }
        
        // Validate username format
        const usernameRegex = /^[a-z0-9_]{3,30}$/;
        if(!usernameRegex.test(normalizedUsername)){
            return res.status(400).json({message:"Username must be 3-30 characters and contain only lowercase letters, numbers, and underscores"});
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(normalizedEmail)){
            return res.status(400).json({message:"Invalid email format"});
        }
        
        // Check if email exists
        const existingEmail = await User.findOne({email: normalizedEmail});
        if(existingEmail) return res.status(400).json({message:"Email is already registered"});
        
        // Check if username exists
        const existingUsername = await User.findOne({username: normalizedUsername});
        if(existingUsername) return res.status(400).json({message:"Username is already taken"});
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

            // Generate email verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const  newUser = new User({
            fullName: normalizedFullName,
            email: normalizedEmail,
            username: normalizedUsername,
            password:hashedPassword,
            gender: ["male", "female", "other"].includes(gender) ? gender : "",
            birthday: birthday || null,
            country: country || "",
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
            isEmailVerified: false,
        });
        if (newUser) {
            const savedUser = await newUser.save();
            
            // Create verification link
            const verificationLink = `${ENV.CLIENT_URL}/verify-email?token=${verificationToken}`;

                    try{
                        const delivery = await sendVerificationEmail(savedUser.email, savedUser.fullName, verificationLink);
                        console.log("✅ Verification email sent to:", savedUser.email, "via", delivery?.provider || "unknown");

                        res.status(201).json({
                                _id:newUser._id,
                                fullName:newUser.fullName,
                                email:newUser.email,
                                username:newUser.username,
                                profilePic:newUser.profilePic,
                                gender:newUser.gender,
                                birthday:newUser.birthday,
                                country:newUser.country,
                                isEmailVerified:newUser.isEmailVerified,
                                message: "Account created! Please check your email to verify your account.",
                                emailDelivery: {
                                        sent: true,
                                        provider: delivery?.provider || "unknown"
                                }
                        });
                    }catch(error){
                        console.log("❌ Failed to send verification email:", error);
                            await User.findByIdAndDelete(savedUser._id);
                            return res.status(503).json({
                                message: "Signup failed because verification email could not be delivered. Please try again after email settings are fixed.",
                                emailDelivery: {
                                    sent: false,
                                    provider: null,
                                    error: error?.message || "Unknown email delivery error"
                                }
                        });
                    }





        }else{
            res.status(400).json({message:"invalid user data"});
        }


    }catch(error){
        console.log("Error in signup controller:",error); 
        if (error?.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";
            return res.status(400).json({
                message: `${duplicateField} is already in use`,
            });
        }
        if (error?.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid signup data",
            });
        }
        res.status(500).json({message:"Server error"});
    }
};
export const login = async (req,res) => {
const {emailOrUsername,password} = req.body; 
 
    if(!emailOrUsername || !password){
        return res.status(400).json({message:"Email/username and password are required"});
   }
try{
    // Find user by email or username
    const user = await User.findOne({
        $or: [{email: emailOrUsername}, {username: emailOrUsername.toLowerCase()}]
    });
     if(!user){ return res.status(400).json({message:"Invalid credentials"});}
     const isPasswordCorrect = await bcrypt.compare(password,user.password);
     if(!isPasswordCorrect){ return res.status(400).json({message:"Invalid credentials"});}
        
        // Check if email is verified (skip for Google OAuth users)
        if (!user.isEmailVerified && !user.googleId) {
            return res.status(403).json({
                message: "Please verify your email before logging in. Check your inbox for the verification link.",
                emailNotVerified: true,
                email: user.email
            });
        }
        
        generateToken(user._id,res);
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            username:user.username,
            profilePic:user.profilePic,
            isEmailVerified:user.isEmailVerified,
        });

    }catch(error){
        console.log("Error in login controller:",error);
        res.status(500).json({message:" Internal server error"});
    }
};
  
export const logout = (_,res) => { 
   res.cookie("jwt","",{maxAge:0})
   res.status(200).json({message:"Logged out successfully"});
};
export const updateProfile = async (req, res) => {
    try{
        const {profilePic, fullName, username, email, bio } = req.body;
        console.log("Update profile request received");
        
        const userId = req.user._id;
        const updateData = {};
        
        // Update profile picture if provided
        if(profilePic) {
            console.log("Uploading to Cloudinary for user:", userId);
            const uploadResponse = await cloudinary.uploader.upload(profilePic, {
                folder: 'profile_pictures',
            });
            console.log("Cloudinary upload successful:", uploadResponse.secure_url);
            updateData.profilePic = uploadResponse.secure_url;
        }
        
        // Update other fields if provided
        if(fullName) updateData.fullName = fullName;
        if(email) updateData.email = email;
        if(bio !== undefined) updateData.bio = bio;
        
        // Check if username is being changed and if it's available
        if(username && username !== req.user.username) {
            const existingUsername = await User.findOne({ username: username.toLowerCase() });
            if(existingUsername) {
                return res.status(400).json({message: "Username is already taken"});
            }
            updateData.username = username.toLowerCase();
        }
        
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {new:true}).select("-password");
        
        console.log("User updated successfully");
        res.status(200).json(updatedUser);

    }catch(error){
        console.log("Error in updateProfile controller:", error.message);
        console.log("Full error:", error);
        res.status(500).json({message: error.message || "Internal server error"});
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both current and new passwords are required" });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }
        
        // Find user and include password
        const user = await User.findById(userId);
        if (!user.password) {
            return res.status(400).json({ message: "Cannot change password for Google-authenticated accounts" });
        }
        
        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password
        user.password = hashedPassword;
        await user.save();
        
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.log("Error in changePassword controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const googleAuth = async (req, res) => {
    const { credential, gender, birthday, country } = req.body;
    
    try {
        // Verify Google token (you'll need to install google-auth-library)
        // For now, we'll extract email and name from the credential
        // In production, verify the token with Google
        const { email, name, googleId, picture } = req.body;
        
        if (!email || !name) {
            return res.status(400).json({ message: "Invalid Google credential" });
        }
        
        // Check if user already exists
        let user = await User.findOne({ $or: [{ email }, { googleId }] });
        
        if (user) {
            // User exists, log them in
            generateToken(user._id, res);
            return res.status(200).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                username: user.username,
                profilePic: user.profilePic,
                gender: user.gender,
                birthday: user.birthday,
                country: user.country,
            });
        }
        
        // Generate unique username for Google user
        let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
        
        // Check if username exists, if so add random numbers
        let usernameExists = await User.findOne({ username });
        while (usernameExists) {
            username = `${email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')}_${Math.floor(Math.random() * 10000)}`;
            usernameExists = await User.findOne({ username });
        }
        
        // Create new user
        const newUser = new User({
            fullName: name,
            username,
            email,
            googleId,
            profilePic: picture || "",
            gender: gender || "",
            birthday: birthday || null,
            country: country || "",
            isEmailVerified: true, // Google users are auto-verified
        });
        
        const savedUser = await newUser.save();
        generateToken(savedUser._id, res);
        
        res.status(201).json({
            _id: savedUser._id,
            fullName: savedUser.fullName,
            email: savedUser.email,
            username: savedUser.username,
            profilePic: savedUser.profilePic,
            gender: savedUser.gender,
            birthday: savedUser.birthday,
            country: savedUser.country,
        });
        
        // Send welcome email
        try {
            await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
        } catch (error) {
            console.log("Failed to send welcome email:", error);
        }
        
    } catch (error) {
        console.log("Error in googleAuth controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// Check username availability
export const checkUsername = async (req, res) => {
    try {
        const { username } = req.params;
        
        // Validate username format
        const usernameRegex = /^[a-z0-9_]{3,30}$/;
        if(!usernameRegex.test(username)){
            return res.status(400).json({
                available: false, 
                message: "Username must be 3-30 characters and contain only lowercase letters, numbers, and underscores"
            });
        }
        
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        
        if (existingUser) {
            return res.status(200).json({ 
                available: false, 
                message: "Username is already taken" 
            });
        }
        
        res.status(200).json({ 
            available: true, 
            message: "Username is available" 
        });
    } catch (error) {
        console.log("Error in checkUsername:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Verify email
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({ message: "Verification token is required" });
        }
        
        // Find user with this token and check if it's not expired
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ 
                message: "Invalid or expired verification token" 
            });
        }
        
        // Update user as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();
        
        // Now generate token and log them in
        generateToken(user._id, res);
        
        res.status(200).json({ 
            message: "Email verified successfully! You can now login.",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                username: user.username,
                profilePic: user.profilePic,
                isEmailVerified: user.isEmailVerified
            }
        });
        
        // Send welcome email after verification
        try {
            await sendWelcomeEmail(user.email, user.fullName, ENV.CLIENT_URL);
        } catch (error) {
            console.log("Failed to send welcome email:", error);
        }
        
    } catch (error) {
        console.log("Error in verifyEmail controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Resend verification email
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = (email || "").trim().toLowerCase();
        
        if (!normalizedEmail) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        const user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }
        
        // Generate new verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = verificationExpires;
        await user.save();
        
        // Create verification link
        const verificationLink = `${ENV.CLIENT_URL}/verify-email?token=${verificationToken}`;
        
        // Send verification email
        try {
            const delivery = await sendVerificationEmail(user.email, user.fullName, verificationLink);
            res.status(200).json({ 
                message: "Verification email sent! Please check your inbox.",
                emailDelivery: {
                    sent: true,
                    provider: delivery?.provider || "unknown"
                }
            });
        } catch (error) {
            console.log("Failed to send verification email:", error);
            res.status(503).json({
                message: "Failed to send verification email",
                emailDelivery: {
                    sent: false,
                    provider: null,
                    error: error?.message || "Unknown email delivery error"
                }
            });
        }
        
    } catch (error) {
        console.log("Error in resendVerification controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};
