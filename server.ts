import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.listen(process.env.ONE_AUTH_SERVER_PORT, () => {
    console.log(`One Auth Server is running on http://localhost:${process.env.ONE_AUTH_SERVER_PORT}`);
});
