const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is missing from Backend/.env');
    }

    if (mongoUri.includes('<db_password>')) {
      throw new Error('MONGO_URI still contains <db_password>. Replace it with your real MongoDB Atlas password.');
    }

    const conn = await mongoose.connect(mongoUri, {
      family: 4,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
