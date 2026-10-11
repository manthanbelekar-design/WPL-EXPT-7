const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_db');
        console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}, Database -> ${conn.connection.name}`);
    } catch (error) {
        console.error(`[MongoDB Connection Error]: ${error.message}`);
        console.error('Make sure your MongoDB server (mongod or MongoDB Compass) is running on port 27017, or specify a valid MONGO_URI in .env');
        // We do not exit process immediately so server can still serve informative health check
    }
};

module.exports = connectDB;
