const express=require('express')
const mongoose=require('mongoose')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {userschema,messageschema,roomschema}=require('../models/schema')
const registeruser = async (req, res) => {
    try {
        // console.log(req.body);
        const existingUser = await userschema.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new userschema({ username: req.body.username, password: hashedPassword });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error); 
        res.status(400).json({ error: "Error registering user" });
    }
};
const loginuser = async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await userschema.findOne({ username });
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  
      res.json({ token, userId: user._id  ,actualname :user.username});
    } catch (error) {
      console.error(error); 
      res.status(500).json({ error: "Error logging in" });
    }
};
  
const getRoomMessages = async (req, res) => {
    try {
      const { room } = req.params;
      const messages = await messageschema.find({ room }).select('userId message');
    //   console.log(messages)
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while fetching messages." });
    }
  };


const getRoomAdmins=async(req,res)=>{
    try {
      const {room} =req.params
      // console.log(room)
      const allusers=await roomschema.find({room});
      // console.log(allusers)
      res.json(allusers);
      
    } catch (error) {
      res.status(500).json({error:""})
      console.log(error)
    }
  }
const makeRoomAdmins=async (req,res) => {
  try {
    const {roomname,username}=req.params
    // const every=await roomschema.find({}) 
    // console.log(every)
    const room = await roomschema.findOne({ roomname });
    if (!room) {
        res.status(500).json({"message":"room not found"})
    }
    const user = room.users.find((u) => u.username === username);
    if (!user) {
      throw new Error("User not found");
    }
    user.isadmin=true;
    await room.save();
    res.status(200).json({"message":"User is now an admin now"})
  } catch (error) {
    console.log(error)
  }
}
const createadminroom=async (req,res) => {
  try {
    const {roomname,username,actualname}=req.params
    // console.log(actualname)
    let room=await roomschema.findOne({room:roomname})
    if(!room){
      // console.log(`${roomname} not found `)
      room =new roomschema({
        room:roomname,
        users:[{username,isadmin:true,actualname}],
      })
    }
    else{
      const user = room.users.find((u) => u.username === username);
      if (!user) {
        room.users.push({username:username,isadmin:false,actualname:actualname});
        // console.log(`${username} has entered the  room  ${roomname}`)
      }
    }
    await room.save();
    res.status(200).json(room);
  } 
  catch (error) {
    console.log(error)
  }
}
const getDelete = async (req, res) => {
  try {
    const { room, userid } = req.params;
    const roomDetails = await roomschema.findOne({ room: room });
    if (!roomDetails) {
      return res.status(404).json({ error: "Room not found" });
    }
    const user = roomDetails.users.find(u => u.username === userid);
    if (!user || !user.isadmin) {
      return res.status(403).json({ error: "Unauthorized: Only room admins can delete this room" });
    }
    await messageschema.deleteMany({ room: room });
    await roomschema.deleteOne({ room: room });
    res.status(200).json({ message: "Successfully deleted the chat room and its messages" });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not delete room" });
  }
};


const getRoomDetails = async (roomName) => {
  try {
    const roomDetails = await roomschema.findOne({ room: roomName });
    return roomDetails; 
  } catch (error) { 
    console.log("Error fetching room details:", error);
    return null;
  }
};
//onfrontend make a variabel true for checking adming or not  
//then if 
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const updateRoomSettings = async (req, res) => {
  try {
    const { room } = req.params;
    const { aiFeatures } = req.body;
    
    const updatedRoom = await roomschema.findOneAndUpdate(
      { room },
      { $set: { aiFeatures } },
      { new: true }
    );
    
    if (!updatedRoom) return res.status(404).json({ error: "Room not found" });
    res.json(updatedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

module.exports={loginuser,registeruser,getRoomMessages,makeRoomAdmins,getDelete,getRoomAdmins,createadminroom,getRoomDetails,updateRoomSettings}