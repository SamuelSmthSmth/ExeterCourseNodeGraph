class CourseController {
    constructor(courseModel) {
        this.courseModel = courseModel;
    }

    async getAllCourses(req, res) {
        try {
            const courses = await this.courseModel.find({});
            res.status(200).json(courses);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching courses', error });
        }
    }

    async getCourseById(req, res) {
        const { id } = req.params;
        try {
            const course = await this.courseModel.findById(id);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.status(200).json(course);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching course', error });
        }
    }

    async getRelatedModules(req, res) {
        const { id } = req.params;
        try {
            const course = await this.courseModel.findById(id).populate('modules');
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.status(200).json(course.modules);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching related modules', error });
        }
    }
}

export default CourseController;