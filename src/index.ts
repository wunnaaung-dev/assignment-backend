import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import { registerRouter } from './routes';
import { errorHandler } from './middlewares/error-handling';

dotenv.config();

const app: Application = express();
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200
  })
)

app.use(registerRouter)

//error-handling middleware
app.use(errorHandler)

const port = process.env.PORT || 8000;


app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port} and I say hello`);
});