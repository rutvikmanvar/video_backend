import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from './routes/user_routes.js';
import videoRouter from './routes/video_routes.js';
import playlistRouter from './routes/playlist_routes.js';
import tweetRouter from './routes/tweet_routes.js';
import commentRouter from './routes/comment_routes.js';
import likeRouter from './routes/like_routes.js';
import subsscriptionRouter from './routes/subscription_routes.js'

app.use('/api/v1/users',userRouter)
app.use('/api/v1/video',videoRouter)
app.use('/api/v1/playlist',playlistRouter)
app.use('/api/v1/tweet',tweetRouter)
app.use('/api/v1/comment',commentRouter)
app.use('/api/v1/like',likeRouter)
app.use('/api/v1/subscription',subsscriptionRouter)


export {app};