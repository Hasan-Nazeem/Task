require('dotenv').config();
const mongoose = require('mongoose');
const keys = require('../config/keys');

const setupDB = async () => {
  if (!keys.database.url) {
    throw new Error('MONGO_URI is required');
  }

  mongoose.set('useCreateIndex', true);
  await mongoose.connect(keys.database.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    serverSelectionTimeoutMS: 10000
  });

  console.log('MongoDB Connected!');
  return mongoose.connection;
};

module.exports = setupDB;
