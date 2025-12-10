import app from './app.ts';
import config from './configs/env.ts';
import connectDB from "./configs/db.ts";

const startServer = async () => {
    await connectDB();
    app.listen(config.port, () => {
        console.log(`One Auth Server is running on http://localhost:${config.port}`);
    });
};

startServer();
