const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Student name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long']
        },
        rollNo: {
            type: String,
            required: [true, 'Roll number is required'],
            unique: true,
            trim: true,
            uppercase: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address'
            ]
        },
        branch: {
            type: String,
            required: [true, 'Branch is required'],
            enum: [
                'Computer Engineering',
                'Information Technology',
                'Artificial Intelligence & Data Science',
                'Electronics & Telecommunication',
                'Mechanical Engineering',
                'Civil Engineering'
            ]
        },
        semester: {
            type: Number,
            required: [true, 'Semester is required'],
            min: [1, 'Semester must be between 1 and 8'],
            max: [8, 'Semester must be between 1 and 8']
        },
        cgpa: {
            type: Number,
            required: [true, 'CGPA is required'],
            min: [0, 'CGPA cannot be less than 0'],
            max: [10, 'CGPA cannot exceed 10']
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
        },
        gender: {
            type: String,
            required: [true, 'Gender is required'],
            enum: ['Male', 'Female', 'Other']
        },
        dateOfBirth: {
            type: Date,
            required: [true, 'Date of birth is required']
        },
        address: {
            type: String,
            trim: true,
            default: 'Not Provided'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Student', studentSchema);
