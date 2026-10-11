const Student = require('../models/Student');

// 1. CREATE: Insert a new student application
exports.createStudent = async (req, res) => {
    try {
        const student = new Student(req.body);
        const savedStudent = await student.save();
        res.status(201).json({
            success: true,
            message: 'Student application submitted successfully!',
            data: savedStudent
        });
    } catch (error) {
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `Duplicate Error: A student with this ${duplicateField} already exists.`
            });
        }
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 2. READ: Get all students (Supports projection and basic search)
exports.getAllStudents = async (req, res) => {
    try {
        const { branch, semester, sort, project } = req.query;
        let query = {};

        if (branch) query.branch = branch;
        if (semester) query.semester = Number(semester);

        // Handle Projection: e.g. project=name,rollNo,branch,-_id
        let projection = null;
        if (project) {
            projection = project.split(',').join(' ');
        }

        let studentQuery = Student.find(query, projection);

        // Sorting
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            studentQuery = studentQuery.sort(sortBy);
        } else {
            studentQuery = studentQuery.sort({ createdAt: -1 });
        }

        const students = await studentQuery.exec();
        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. READ: Get single student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: `Student not found with id ${req.params.id}`
            });
        }
        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid Student ID format'
        });
    }
};

// 4. UPDATE: Update student information by ID
exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: `Student not found with id ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student record updated successfully!',
            data: student
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 5. DELETE: Remove student by ID
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: `Student not found with id ${req.params.id}`
            });
        }
        res.status(200).json({
            success: true,
            message: 'Student deleted successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 6. ADVANCED QUERY DEMO: Comparison, Logical Operators and Projection
// Demonstrates MongoDB Shell concepts integrated into Express/Mongoose API
exports.advancedQuery = async (req, res) => {
    try {
        const { minCgpa, maxCgpa, branches, sem, logicalOp } = req.query;

        // Building conditions using comparison operators
        let conditions = [];

        // Comparison: $gte, $lte
        if (minCgpa) {
            conditions.push({ cgpa: { $gte: parseFloat(minCgpa) } });
        }
        if (maxCgpa) {
            conditions.push({ cgpa: { $lte: parseFloat(maxCgpa) } });
        }

        // Comparison: $in (multiple branches)
        if (branches) {
            const branchList = branches.split(',');
            conditions.push({ branch: { $in: branchList } });
        }

        // Exact match
        if (sem) {
            conditions.push({ semester: Number(sem) });
        }

        let mongoFilter = {};

        // Applying Logical Operator: $or, $and, $nor
        if (conditions.length > 0) {
            if (logicalOp === 'OR') {
                mongoFilter = { $or: conditions };
            } else if (logicalOp === 'NOR') {
                mongoFilter = { $nor: conditions };
            } else {
                // Default: $and
                mongoFilter = { $and: conditions };
            }
        }

        // Projection: Retrieve specific fields
        const projection = { name: 1, rollNo: 1, branch: 1, semester: 1, cgpa: 1, email: 1 };

        const results = await Student.find(mongoFilter, projection).sort({ cgpa: -1 });

        res.status(200).json({
            success: true,
            appliedFilter: mongoFilter,
            count: results.length,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
