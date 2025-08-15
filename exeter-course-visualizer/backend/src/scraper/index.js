const axios = require('axios');
const cheerio = require('cheerio');
const Course = require('../models/courseModel');

const BASE_URL = 'https://www.exeter.ac.uk/studying/undergraduate/courses/'; // Update with the actual URL for undergraduate courses
const MASTERS_URL = 'https://www.exeter.ac.uk/studying/postgraduate/courses/'; // Update with the actual URL for master's courses

async function scrapeCourses() {
    try {
        const response = await axios.get(BASE_URL);
        const $ = cheerio.load(response.data);
        
        // Assuming the course links are contained in a specific selector
        const courseLinks = $('selector-for-course-links').map((i, el) => $(el).attr('href')).get();

        for (const link of courseLinks) {
            const courseResponse = await axios.get(link);
            const coursePage = cheerio.load(courseResponse.data);

            const moduleTitle = coursePage('selector-for-module-title').text();
            const creditValue = coursePage('selector-for-credit-value').text();
            const prerequisites = coursePage('selector-for-prerequisites').text();
            const summary = coursePage('selector-for-summary').text();
            const learningOutcomes = coursePage('selector-for-learning-outcomes').text();
            const assessmentMethods = coursePage('selector-for-assessment-methods').text();

            const courseData = new Course({
                moduleTitle,
                creditValue,
                prerequisites,
                summary,
                learningOutcomes,
                assessmentMethods
            });

            await courseData.save();
        }
    } catch (error) {
        console.error('Error scraping courses:', error);
    }
}

module.exports = {
    scrapeCourses
};