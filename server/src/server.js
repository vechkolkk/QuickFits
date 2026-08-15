import 'dotenv/config';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const port = process.env.PORT || 5000;

async function bootstrap() {
  await connectDb();
  const app = createApp();

  app.listen(port, () => {
    console.log(`QuickFit API running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
