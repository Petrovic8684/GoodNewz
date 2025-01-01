const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_STRING);

    console.log(`[DB] Connected to: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
