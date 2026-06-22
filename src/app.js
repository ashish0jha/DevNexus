const express = require('express');
require("dotenv").config();
const connectDB = require("./config/database")
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require('./routes/profile');
const userRouter = require('./routes/user');
const requestRouter = require('./routes/requests');

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",userRouter);
app.use("/",requestRouter);

connectDB()
    .then(()=>{
        console.log("Database Connected Succesfully");
        app.listen(3000,()=>{
            console.log("Server Started at Port 3000");
        })
    })
    .catch((err)=>{
        console.log("Error : DataBase can't Connect " + err.message);
    })