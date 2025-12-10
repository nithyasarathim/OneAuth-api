import mongoose from 'mongoose';
import config from './env';

const connectDB = async function () {
    try {
        await mongoose.connect(config.databaseUrl);
        console.log("MongoDB Connection : SUCCESS");
    } catch (err) {
        console.log("MongoDB Connection : FAILURE");
        process.exit(1);
    }
};

export default connectDB;