import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { connectDB } from './config/database';
import routes from './routes/index';
import health from './routes/health';
import { errorHandler } from 'middleware/error.middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/health', health);
app.use('/api', routes);
app.use(errorHandler);
// Root route
app.get('/', (req, res) => {
  res.send("AURA Server is running");
});

async function start() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Backend listening on http://localhost:${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log(`🔗 API endpoints: http://localhost:${config.port}/api`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();


