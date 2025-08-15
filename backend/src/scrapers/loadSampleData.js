const mongoose = require('mongoose');
const { loadSampleData } = require('./sampleData');
require('dotenv').config();

async function loadSample() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/exeter-courses';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Load sample data
    await loadSampleData();

    console.log('Sample data loaded successfully!');
  } catch (error) {
    console.error('Error loading sample data:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Gracefully shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

loadSample();
