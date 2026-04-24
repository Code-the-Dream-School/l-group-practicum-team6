import "dotenv/config";

import app from "./app";
import { connectDB } from "./db/connect";

const PORT: string | number = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI environment variable is not set");
  process.exit(1);
}

const mongoUri: string = MONGO_URI;

async function start(): Promise<void> {
  await connectDB(mongoUri);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
