import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser"
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

const app = express()

// Security middleware
app.use(helmet())
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later"
}))

app.use(cors({
    origin : process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials : true
}))
app.use(express.json({limit :"16kb"}))
app.use(express.urlencoded({extended : true ,limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Import routes
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import healthcheckRouter from './routes/healthcheck.routes.js'

// Register routes
app.use('/api/v1/users', userRouter)
app.use('/api/v1/videos', videoRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/likes', likeRouter)
app.use('/api/v1/subscriptions', subscriptionRouter)
app.use('/api/v1/tweets', tweetRouter)
app.use('/api/v1/playlists', playlistRouter)
app.use('/api/v1/dashboard', dashboardRouter)
app.use('/api/v1/healthcheck', healthcheckRouter)

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