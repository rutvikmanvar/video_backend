import dotenv from 'dotenv';
dotenv.config({
    path:'./.env'
});
import connectDB from "./db/db.js";
import { app } from './app.js';
import express from 'express';

const router = express.Router()

console.log("MONGODB_URI from process.env:", process.env.MONGODB_URI);

connectDB()
.then(() => {
    app.listen(process.env.PORT || 7000,() => {
        console.log(`Server started at PORT ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log(`Error while connecting DB : ${err}`)
})

app.use('/',router)
