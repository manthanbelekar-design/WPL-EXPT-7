const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Advanced Query / Shell Operator Demonstration Endpoint
router.get('/advanced/search', studentController.advancedQuery);

// Standard CRUD Endpoints
router.route('/')
    .get(studentController.getAllStudents)
    .post(studentController.createStudent);

router.route('/:id')
    .get(studentController.getStudentById)
    .put(studentController.updateStudent)
    .delete(studentController.deleteStudent);

module.exports = router;
