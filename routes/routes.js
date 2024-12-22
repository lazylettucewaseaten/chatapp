const express=require('express')
const router=express.Router()
const {loginuser,registeruser, getRoomMessages}=require('../controllers/functions');
router.route('/login').post(loginuser);
router.route('/register').post(registeruser)
router.route("/rooms/:room/messages").get(getRoomMessages)
module.exports=router