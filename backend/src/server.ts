import "dotenv/config";

import app from "./app";
import connectMongo from "./config/db.mongo";

const PORT: string | number = process.env.PORT || 5001;

const start = async () => {
  try {
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
