const express=require('express')
const mongoose=require('mongoose')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {userschema,messageschema}=require('../models/schema')
const registeruser = async (req, res) => {
    try {
        console.log(req.body);
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
  
      res.json({ token, userId: user._id  });
    } catch (error) {
      console.error(error); 
      res.status(500).json({ error: "Error logging in" });
    }
};
  
const getRoomMessages = async (req, res) => {
    try {
      const { room } = req.params;
    //   console.log(room)
      const messages = await messageschema.find({ room }).select('userId message');
    //   console.log(messages)
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while fetching messages." });
    }
  };

module.exports={loginuser,registeruser,getRoomMessages}