const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/exeter-courses';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connection successful');
    
    // Test basic functionality
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
