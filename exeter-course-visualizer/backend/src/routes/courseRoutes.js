const express = require('express');
const CourseController = require('../controllers/courseController');

const router = express.Router();
const courseController = new CourseController();

const setRoutes = (app) => {
    router.get('/courses', courseController.getAllCourses.bind(courseController));
    router.get('/courses/:id', courseController.getCourseById.bind(courseController));
    router.get('/courses/:id/modules', courseController.getCourseModules.bind(courseController));
    
    app.use('/api', router);
};

module.exports = setRoutes;