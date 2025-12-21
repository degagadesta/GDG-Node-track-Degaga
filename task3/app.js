import express from 'express';
import morgan from 'morgan';
import bookRoutes from './routes/bookRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(morgan('dev'));     
app.use(express.json());

app.use('/books', bookRoutes);

app.use(errorHandler);

export default app;
