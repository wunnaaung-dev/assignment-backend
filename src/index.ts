import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import mongoose from 'mongoose';
import { registerRouter } from './routes';
import { errorHandler } from './middlewares/error-handling';
import cookieParser from 'cookie-parser';

dotenv.config();

const app: Application = express();
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
)

app.use(registerRouter)

//error-handling middleware
app.use(errorHandler)

const port = process.env.PORT || 8000;

const start = async() => {
  if(!process.env.MONGODB_URI) throw new Error("Mongo DB URI is not defined")

  try {
    await mongoose.connect(process.env.MONGODB_URI)
  } catch (error) {
    throw new Error("Database Error")
  }

  app.listen(port, () => console.log(`Server running on ${port}`))
}

start()