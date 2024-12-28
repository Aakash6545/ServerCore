import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({
  path: "./.env",
});

const app = express();

// Connect to the database
connectDB()
  .then(() => {
    // Only start the server if the database connection is successful
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    // Log the error and stop the app from starting if the database connection fails
    console.error("Error connecting to the database:", error.message);
    process.exit(1);  // Exit the application with a failure code
  });

  