const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

/////// Database //////////////////
mongoose.connect("mongodb+srv://Deepak25:gta5mods@cluster0.bk2xyo5.mongodb.net/testingChat?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log("Database Connected")
})

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
})


 const User = new mongoose.model("User", userSchema)

app.post("/login", (req, res) => {
  const { email, password} = req.body
  User.findOne({email: email}, (err, user) => {
      if(user){
            if(password===user.password){
               res.send({message: "Login Succesfull", user: user})
            }else{
               res.send({message: "Password didn,t Matched"})
            }
      } else {
        res.send({message: "User is not registered"})
      }
   })
})

app.post("/register", (req, res) => {
  const {name, email, password} = req.body
  console.log(User)
  User.findOne({email: email}, (err, user) => {
    console.log(user)
     if(user){
          res.send({message: "User already registered"})
     } else {
       const user = new User({
        name,
        email,
        password
       })
       user.save(err => {
        console.log(err)
        if(err){
          res.send(err)
        }else{
          res.send({message: "Registration successfull please login"})
        }
       })
     }
  })
})


////// Chat Server //////////////// 
 
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://chat-app-rn95.onrender.com",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
