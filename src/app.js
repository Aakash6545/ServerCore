import cookieParser from "cookie-parser";
import express from "express";
const app = express();

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// routes import
import userRouter from "./routes/user.routes.js";

app.use("/api/users", userRouter);

export { app };
