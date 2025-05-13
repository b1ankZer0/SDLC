import mongoose from "mongoose";
import { server } from "./server";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/your-database-name";

// Declare a variable to hold the connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB Connected Successfully!");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB Connection Error:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function server() {
  await dbConnect();
  console.log("Server is running on port 3000");
}
