import { createExpressApp } from './app.ts';
import { config } from './config/env.ts';

const app = createExpressApp();
const port = config.port;

app.listen(port, '0.0.0.0', () => {
  console.log(`[GymOS Backend Server] Running on http://0.0.0.0:${port}`);
  console.log(`[GymOS Backend Server] Health check available at http://0.0.0.0:${port}/health`);
});
