import mongoose from 'mongoose'

import express from 'express'
import { DB_NAME } from './constants.js';
import connectDB from './db/index.js';
import { app } from './app.js' 
import dotenv from 'dotenv';
dotenv.config();



const PORT = process.env.PORT


connectDB()
.then(()=>{
     app.listen(PORT || 2001, ()=>{
       console.log(`Server is running at port :${process.env.PORT}`)
      //  console.log(`process.env.CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME}`)
      //  console.log(`process.env.CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY}`)
      //  console.log(`process.env.CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET}`)
     })
})
.catch((error)=>{
    console.log(`Mongo Db is failled , ${error.message}`);
})