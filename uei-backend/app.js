const express = require('express')
const app = express()
const cookieParser=require('cookie-parser');
const studentRouter=require('./routers/studentRouter');

app.use(express.json());
app.use(cookieParser());

app.listen(3000,()=>console.log("server has started on port 3000"));

app.use("/student",studentRouter);
