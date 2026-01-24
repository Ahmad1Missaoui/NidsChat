import Message from "../models/Message.js"
import User  from "../models/User.js"

export const getAllContacts = async (req,res)=> {
 
  try{
      const LoggedInUserId = req.user._id;
      const filteredUsers = await User.find({_id:{$ne:LoggedInUserId}}).select("-password -emailVerified -createdAt -updatedAt -__v");

      res.status(200).json(filteredUsers);  
        
  }catch(error){
    console.log("Error in getAllContacts controller:",error);
    res.status(500).json({message:"Server error"}); 
  }};
export const getMessageById = async (req,res)=> {
 
  try{
      const myId = req.user._id;
      const {id:userToChatId} = req.params;
      const message =await Message.findOne({
        $or:[
               {senderId:myId,receiverId:userToChatId},
               {senderId:userToChatId,receiverId:myId},


            ],
    });

    res.status(200).json(message);

  }catch(error){
    console.log("Error in getMessageById controller:",error);
    res.status(500).json({message:"Server error"}); 
  }
};
export const sendMessage    = async (req , res) => {
       try {
               const {text ,image} = req.body;  
               const {id : receiverId} = req.params;  
               const senderId = req.user._id;

               let imageUrl = null;
                if(image){

                  const uploadedImage = await cloudinary.uploader.upload(image);
                    imageUrl= uploadedImage.secure_url;
                  
                } 
                const newMessage = new Message({
                    senderId,
                    receiverId,
                    text,
                    image:imageUrl,
                });

                // todo : send message in real time if user is online =socket.io

            await newMessage.save();
            res.status(201).json(newMessage);
       }catch (error) {
            console.log("Error in sendMessage controller:",error.message);
            res.status(500).json({message:"Server error"});


       }


};
export const getAllChats    = async (req, res)=> {

      try {

             const loggedInUserId = req.user._id;
              
             const messages = await Message.find({
                $or:[
                    {senderId:loggedInUserId},
                    {receiverId:loggedInUserId},
                ],
             });

             const chatPartnersId = [
              ...new Set(messages.map((msg) => 
              msg.senderId.toString() === loggedInUserId.toString() 
             ? msg.receiverId.toString() 
             : msg.senderId.toString()
             )
          ),
       ];

       const chatPartners = await User.find({_id: {$in: chatPartnersId}}).select("-password -emailVerified -createdAt -updatedAt -__v");
       res.status(200).json(chatPartners);
  
      }catch (error) {
        console.error("Error in getAllChats controller:",error.message);
        res.status(500).json({message:"Server error"});

      }






};

