import express from "express";
import dotenv from "dotenv";
import connectDB from "./configs/db";

dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.listen(process.env.ONE_AUTH_SERVER_PORT, () => {
    console.log(`One Auth Server is running on http://localhost:${process.env.ONE_AUTH_SERVER_PORT}`);
});
