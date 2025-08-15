const mongoose = require('mongoose');
const ExeterCourseScraper = require('./courseScraper');
require('dotenv').config();

async function runScraper() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/exeter-courses';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Create and run scraper
    const scraper = new ExeterCourseScraper();
    await scraper.scrapeAll();

    console.log('Scraping completed successfully!');
  } catch (error) {
    console.error('Error running scraper:', error);
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

runScraper();
