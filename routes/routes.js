const express=require('express')
const router=express.Router()
const {loginuser,registeruser, getRoomMessages,makeRoomAdmins, getDelete, getRoomAdmins, createadminroom}=require('../controllers/functions');
router.route('/login').post(loginuser);
router.route('/register').post(registeruser)
router.route("/rooms/:room/messages").get(getRoomMessages)
router.route('/delete/:room').delete(getDelete)
router.route('/makeroom/:roomname/:username/:actualname').patch(createadminroom)
router.route('/getadmins/:room').get(getRoomAdmins) 

router.route('/updateadmins/:roomname/:username').patch(makeRoomAdmins)
module.exports=router