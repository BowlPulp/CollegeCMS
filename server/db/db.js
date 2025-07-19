const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // No need for useNewUrlParser or useUnifiedTopology with latest drivers
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
