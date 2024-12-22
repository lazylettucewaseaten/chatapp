const express=require('express')
const app=express()
const cors=require('cors')
const {createServer}=require('http')
require('dotenv').config()
const route=require('./routes/routes')
const connectDB=require('./database/connectdb')
const socketHandler = require('./socket');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors())


const server = createServer(app);
app.use(cors())



app.get('/',(req,res)=>{
    res.send("Something is there")
})
app.use('/',route)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
const port=3000
const start =async () => {
    try {
        console.log('Trying')
        await connectDB(process.env.URI)
        socketHandler(server)
        server.listen(port,console.log('Server is on'))    
    } catch (error) {
        console.log(error)
    }
}
start()