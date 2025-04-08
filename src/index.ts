import express from "express";
import dotenv from "dotenv";
dotenv.config();
import router from "./routes";
import mongoose from "mongoose";

export const app = express();

app.use(express.json());

app.use(router);

const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined");
}

if (process.env.NODE_ENV !== "test") {
  if (!process.env.PORT) {
    console.error("PORT is not defined");
    console.log("Setting port to default: 3000");
  }
  const PORT = process.env.PORT || 3000;
  mongoose
    .connect(MONGO_URI)
    .then((result) => {
      console.log("connected to bills db");
    })
    .catch((err: any) => console.log(err));
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
