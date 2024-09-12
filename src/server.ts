import express, { json } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors, { type CorsOptions } from 'cors';
import { dbConnection } from './config/db';
import ProjectRouter from './routes/projectRoutes';
import AuthRouter from './routes/authRoutes';

dotenv.config();
dbConnection();

const app = express();

const corsOptions: CorsOptions = {
  origin: [process.env.FRONTEND_URL!],
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(json());
app.use('/api/v1/projects', ProjectRouter);
app.use('/api/v1/auth', AuthRouter);

export default app;
