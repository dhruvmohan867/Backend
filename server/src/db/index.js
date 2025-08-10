import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js';

const connectDB = async ()=>{
   try {
   const connections = await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
     console.log(process.env.MONGODB_URL)
     console.log(`\n MongoDB connected || DB Host : ${connections.connection.host}`);
     console.log(`properties: ${connections.Collection}`)
     
    // // app.on("error",(error)=>{
    // //     console.log("Error:" , error);
    // //     throw error
    // })
    
   } catch (error) {
    console.error(process.env.MONGODB_URL);
     console.log('MongoDB failed at db/index.js', error);
    process.exit(1)
   }
}
export default connectDB