const crypto = require("crypto");
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
const IV_LENGTH = parseInt(process.env.IV_LENGTH, 10) || 16; 
const mongoose=require('mongoose')


//user schema for loggin and reistering 
const userschema=mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
});

//messagge schema for my end to eend encrytpoon


function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }
  
  
  function decrypt(text) {
    const [iv, encryptedText] = text.split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      ENCRYPTION_KEY,
      Buffer.from(iv, "hex")
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
  
const messageschema = mongoose.Schema({
    room: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  });
  messageschema.pre("save", function (next) {
    if (this.isModified("message")) {
      this.message = encrypt(this.message);
    }
    next();
  });
  messageschema.post("init", function (doc) {
    if (doc.message) {
      doc.message = decrypt(doc.message);
    }
  });
module.exports = {
    userschema: mongoose.model('userschema', userschema),
    messageschema:mongoose.model('messageschema',messageschema)
};