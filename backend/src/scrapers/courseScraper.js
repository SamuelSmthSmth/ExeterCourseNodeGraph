const axios = require('axios');
const cheerio = require('cheerio');
const { Course, Module } = require('../models/courseModel');

class ExeterCourseScraper {
  constructor() {
    this.baseUrl = 'https://www.exeter.ac.uk';
    this.coursesUrl = 'https://www.exeter.ac.uk/undergraduate/degrees/';
    this.mastersUrl = 'https://www.exeter.ac.uk/postgraduate/masters/';
    this.delay = 1000; // 1 second delay between requests to be respectful
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(url, retries = 3) {
    try {
      console.log(`Fetching: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      await this.delay(this.delay);
      return response.data;
    } catch (error) {
      if (retries > 0) {
        console.log(`Request failed, retrying... (${retries} attempts left)`);
        await this.delay(2000);
        return this.makeRequest(url, retries - 1);
      }
      throw error;
    }
  }

  async scrapeCoursesIndex(isPostgraduate = false) {
    try {
      const url = isPostgraduate ? this.mastersUrl : this.coursesUrl;
      const html = await this.makeRequest(url);
      const $ = cheerio.load(html);
      
      const courses = [];
      
      // Look for course links - this selector may need adjustment based on actual site structure
      $('.course-list a, .degree-list a, .programme-list a').each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href');
        const text = $link.text().trim();
        
        if (href && text && href.includes('/degrees/') || href.includes('/masters/')) {
          const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          courses.push({
            name: text,
            url: fullUrl,
            isPostgraduate
          });
        }
      });

      // Alternative approach - look for any links containing degree-related keywords
      $('a').each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href');
        const text = $link.text().trim();
        
        if (href && text) {
          // Check if the link looks like a course page
          const degreePattern = /(BSc|BA|BEng|MSc|MA|MEng|PhD|MRes)/i;
          const urlPattern = /(degree|course|programme|masters|undergraduate|postgraduate)/i;
          
          if (degreePattern.test(text) && urlPattern.test(href)) {
            const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
            if (!courses.some(course => course.url === fullUrl)) {
              courses.push({
                name: text,
                url: fullUrl,
                isPostgraduate
              });
            }
          }
        }
      });

      return courses;
    } catch (error) {
      console.error('Error scraping courses index:', error.message);
      return [];
    }
  }

  extractCourseInfo(html, url) {
    const $ = cheerio.load(html);
    
    // Extract course name and degree type
    const pageTitle = $('h1').first().text().trim();
    const courseMatch = pageTitle.match(/^(.+?)\s+(BSc|BA|BEng|MSc|MA|MEng|PhD|MRes)/i);
    
    let courseName = pageTitle;
    let degree = 'BSc'; // Default
    
    if (courseMatch) {
      courseName = courseMatch[1].trim();
      degree = courseMatch[2].toUpperCase();
    }

    // Extract department
    const department = $('.department, .school, .college').first().text().trim() || 
                      $('[class*="department"], [class*="school"], [class*="college"]').first().text().trim() ||
                      'Unknown Department';

    // Extract description
    const description = $('.course-description, .programme-description, .overview').first().text().trim() ||
                       $('p').first().text().trim();

    // Extract duration (default to 3 years for undergrad, 1 for postgrad)
    let duration = degree.startsWith('M') || degree === 'PhD' ? 1 : 3;
    const durationText = $('body').text();
    const durationMatch = durationText.match(/(\d+)\s*years?/i);
    if (durationMatch) {
      duration = parseInt(durationMatch[1]);
    }

    // Generate course code (if not found, create one)
    let courseCode = courseName.replace(/\s+/g, '').substring(0, 6).toUpperCase() + degree;

    return {
      courseName,
      courseCode,
      degree,
      department,
      duration,
      description,
      url,
      modules: { core: [], optional: [] }
    };
  }

  async scrapeModulesFromCoursePage(html, courseUrl) {
    const $ = cheerio.load(html);
    const modules = [];

    // Look for module information in various formats
    const moduleSelectors = [
      '.module',
      '.course-module',
      '.programme-module',
      '[class*="module"]',
      'tr', // Table rows that might contain module info
      'li' // List items that might contain modules
    ];

    for (const selector of moduleSelectors) {
      $(selector).each((index, element) => {
        const $element = $(element);
        const text = $element.text().trim();
        
        // Look for module codes (typically 3-4 letters followed by 4 digits)
        const moduleCodeMatch = text.match(/([A-Z]{2,4}\d{4})/);
        if (moduleCodeMatch) {
          const moduleCode = moduleCodeMatch[1];
          
          // Extract module title (usually after the code)
          let moduleTitle = text.replace(moduleCodeMatch[0], '').trim();
          moduleTitle = moduleTitle.replace(/^[:\-\s]+/, '').replace(/[:\-\s]+$/, '');
          
          // Extract credit value
          const creditMatch = text.match(/(\d+)\s*credits?/i);
          const creditValue = creditMatch ? parseInt(creditMatch[1]) : 15; // Default to 15 credits
          
          if (moduleTitle && moduleTitle.length > 3) {
            modules.push({
              moduleCode,
              moduleTitle,
              creditValue,
              url: courseUrl // We'll update this if we find specific module pages
            });
          }
        }
      });
    }

    return modules;
  }

  async scrapeModuleDetails(moduleUrl) {
    try {
      const html = await this.makeRequest(moduleUrl);
      const $ = cheerio.load(html);

      // Extract detailed module information
      const prerequisites = [];
      const assessmentMethods = [];
      const learningOutcomes = [];

      // Look for prerequisites
      const prereqSection = $(':contains("Prerequisites"), :contains("Pre-requisites"), :contains("Required modules")').parent();
      prereqSection.find('text').each((index, element) => {
        const text = $(element).text();
        const moduleMatch = text.match(/([A-Z]{2,4}\d{4})/g);
        if (moduleMatch) {
          prerequisites.push(...moduleMatch);
        }
      });

      // Look for assessment methods
      const assessmentSection = $(':contains("Assessment"), :contains("Examination")').parent();
      const assessmentText = assessmentSection.text();
      
      // Common assessment patterns
      const examMatch = assessmentText.match(/exam[ination]*[:\s]*(\d+)%/i);
      const courseworkMatch = assessmentText.match(/coursework[:\s]*(\d+)%/i);
      const essayMatch = assessmentText.match(/essay[:\s]*(\d+)%/i);
      
      if (examMatch) assessmentMethods.push({ method: 'Examination', percentage: parseInt(examMatch[1]) });
      if (courseworkMatch) assessmentMethods.push({ method: 'Coursework', percentage: parseInt(courseworkMatch[1]) });
      if (essayMatch) assessmentMethods.push({ method: 'Essay', percentage: parseInt(essayMatch[1]) });

      // Extract learning outcomes
      const outcomesSection = $(':contains("Learning Outcomes"), :contains("Aims"), :contains("Objectives")').parent();
      outcomesSection.find('li, p').each((index, element) => {
        const outcome = $(element).text().trim();
        if (outcome && outcome.length > 10) {
          learningOutcomes.push(outcome);
        }
      });

      // Extract summary of contents
      const summarySection = $(':contains("Content"), :contains("Summary"), :contains("Description"), :contains("Overview")').parent();
      const summaryOfContents = summarySection.text().trim();

      return {
        prerequisites,
        assessmentMethods,
        intendedLearningOutcomes: learningOutcomes,
        summaryOfContents
      };
    } catch (error) {
      console.error(`Error scraping module details from ${moduleUrl}:`, error.message);
      return {
        prerequisites: [],
        assessmentMethods: [],
        intendedLearningOutcomes: [],
        summaryOfContents: ''
      };
    }
  }

  async scrapeCourse(courseInfo) {
    try {
      console.log(`Scraping course: ${courseInfo.name}`);
      
      const html = await this.makeRequest(courseInfo.url);
      const courseData = this.extractCourseInfo(html, courseInfo.url);
      
      // Scrape modules from course page
      const modules = await this.scrapeModulesFromCoursePage(html, courseInfo.url);
      
      // For each module, try to get detailed information
      for (const module of modules) {
        const moduleDetails = await this.scrapeModuleDetails(module.url);
        Object.assign(module, moduleDetails);
      }
      
      return {
        course: courseData,
        modules
      };
    } catch (error) {
      console.error(`Error scraping course ${courseInfo.name}:`, error.message);
      return null;
    }
  }

  async saveToDatabase(courseData, modules) {
    try {
      // Save modules first
      for (const moduleInfo of modules) {
        await Module.findOneAndUpdate(
          { moduleCode: moduleInfo.moduleCode },
          {
            ...moduleInfo,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
      }

      // Update course with module references
      const moduleRefs = modules.map(m => ({
        module: m.moduleCode,
        year: 1 // We might need to extract this information
      }));

      courseData.modules.core = moduleRefs;

      // Save course
      const course = await Course.findOneAndUpdate(
        { courseCode: courseData.courseCode },
        {
          ...courseData,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      console.log(`Saved course: ${course.courseName}`);
      return course;
    } catch (error) {
      console.error('Error saving to database:', error.message);
      throw error;
    }
  }

  async scrapeAll() {
    try {
      console.log('Starting University of Exeter course scraping...');
      
      // Scrape undergraduate courses
      console.log('Scraping undergraduate courses...');
      const undergradCourses = await this.scrapeCoursesIndex(false);
      
      // Scrape postgraduate courses
      console.log('Scraping postgraduate courses...');
      const postgradCourses = await this.scrapeCoursesIndex(true);
      
      const allCourses = [...undergradCourses, ...postgradCourses];
      console.log(`Found ${allCourses.length} courses to scrape`);

      // Scrape each course
      for (let i = 0; i < allCourses.length; i++) {
        const courseInfo = allCourses[i];
        console.log(`Progress: ${i + 1}/${allCourses.length}`);
        
        const result = await this.scrapeCourse(courseInfo);
        if (result) {
          await this.saveToDatabase(result.course, result.modules);
        }
        
        // Add a longer delay between courses to be respectful
        await this.delay(2000);
      }

      console.log('Scraping completed successfully!');
    } catch (error) {
      console.error('Error during scraping:', error.message);
      throw error;
    }
  }
}

module.exports = ExeterCourseScraper;
