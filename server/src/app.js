import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser"
const app = express()
app.use(cors({
    origin : process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials : true
}))
app.use(express.json({limit :"16kb"}))
app.use(express.urlencoded({extended : true ,limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
import userRouter from './routes/user.routes.js'

app.use('/api/v1/users',userRouter)

// Global error handler (place AFTER all routes)
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

export {app}