import "dotenv/config";

import app from "./app";

const PORT: string | number = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
