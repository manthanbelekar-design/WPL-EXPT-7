// Simple Frontend CRUD logic for Experiment 7

const studentForm = document.getElementById('studentForm');
const studentIdInput = document.getElementById('studentId');
const formTitle = document.getElementById('formTitle');
const saveBtn = document.getElementById('saveBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const tableBody = document.getElementById('studentTableBody');
const alertBox = document.getElementById('alertBox');
const countDisplay = document.getElementById('countDisplay');
const queryNote = document.getElementById('queryNote');

// 1. Show message alert on top
function showAlert(message, type = 'success') {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.classList.remove('hidden');
    setTimeout(() => {
        alertBox.classList.add('hidden');
    }, 3500);
}

// 2. READ: Fetch and display all students
async function loadStudents() {
    try {
        const response = await fetch('/api/students');
        const result = await response.json();

        if (result.success) {
            displayTable(result.data);
            queryNote.innerHTML = 'Query: <code>db.students.find({})</code>';
        }
    } catch (err) {
        showAlert('Could not load students. Is the server and MongoDB running?', 'error');
    }
}

// 3. Render student rows in table
function displayTable(students) {
    countDisplay.textContent = students.length;

    if (!students || students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No students found. Add one above!</td></tr>';
        return;
    }

    tableBody.innerHTML = students.map(s => `
        <tr>
            <td><strong>${s.rollNo}</strong></td>
            <td>${s.name}</td>
            <td>${s.branch}</td>
            <td>${s.semester}</td>
            <td>${parseFloat(s.cgpa).toFixed(2)}</td>
            <td>${s.email}</td>
            <td>
                <button class="btn btn-edit" onclick="startEdit('${s._id}', '${s.rollNo}', '${s.name}', '${s.email}', '${s.branch}', ${s.semester}, ${s.cgpa})">Edit</button>
                <button class="btn btn-delete" onclick="deleteStudent('${s._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// 4. CREATE or UPDATE: Handle Form Submit
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = studentIdInput.value;
    const studentData = {
        rollNo: document.getElementById('rollNo').value.trim(),
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        branch: document.getElementById('branch').value,
        semester: Number(document.getElementById('semester').value),
        cgpa: parseFloat(document.getElementById('cgpa').value),
        phone: '9876543210',             // default phone
        gender: 'Male',                   // default gender
        dateOfBirth: '2003-01-01'        // default DOB
    };

    try {
        let response;
        if (id) {
            // UPDATE (PUT)
            response = await fetch(`/api/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
        } else {
            // CREATE (POST)
            response = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
        }

        const result = await response.json();

        if (result.success) {
            showAlert(id ? 'Student updated successfully!' : 'Student added successfully!', 'success');
            resetForm();
            loadStudents();
        } else {
            showAlert(result.message || 'Error saving student', 'error');
        }
    } catch (err) {
        showAlert('Network or server error', 'error');
    }
});

// 5. UPDATE: Fill form for editing
window.startEdit = (id, rollNo, name, email, branch, semester, cgpa) => {
    studentIdInput.value = id;
    document.getElementById('rollNo').value = rollNo;
    document.getElementById('name').value = name;
    document.getElementById('email').value = email;
    document.getElementById('branch').value = branch;
    document.getElementById('semester').value = semester;
    document.getElementById('cgpa').value = cgpa;

    formTitle.textContent = 'Edit Student Record';
    saveBtn.textContent = 'Update Student';
    cancelEditBtn.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Cancel editing mode
cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
    studentForm.reset();
    studentIdInput.value = '';
    formTitle.textContent = 'Add New Student';
    saveBtn.textContent = 'Add Student';
    cancelEditBtn.classList.add('hidden');
}

// 6. DELETE: Delete a student
window.deleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
        const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            showAlert('Student deleted from MongoDB!', 'success');
            loadStudents();
        } else {
            showAlert(result.message, 'error');
        }
    } catch (err) {
        showAlert('Error deleting student', 'error');
    }
};

// 7. FILTER: Search by Branch and CGPA ($gte comparison query)
document.getElementById('applyFilterBtn').addEventListener('click', async () => {
    const minCgpa = document.getElementById('filterCgpa').value;
    const branch = document.getElementById('filterBranch').value;

    let queryParams = new URLSearchParams();
    if (minCgpa) queryParams.append('minCgpa', minCgpa);
    if (branch) queryParams.append('branches', branch);

    let shellText = 'db.students.find({';
    let conditions = [];
    if (minCgpa) conditions.push(`cgpa: { $gte: ${minCgpa} }`);
    if (branch) conditions.push(`branch: "${branch}"`);
    shellText += conditions.join(', ') + '})';
    queryNote.innerHTML = `Query: <code>${shellText}</code>`;

    try {
        const res = await fetch(`/api/students/advanced/search?${queryParams.toString()}`);
        const result = await res.json();
        if (result.success) {
            displayTable(result.data);
            showAlert(`Found ${result.count} student(s) matching criteria.`, 'success');
        }
    } catch (err) {
        showAlert('Filter query failed', 'error');
    }
});

document.getElementById('resetFilterBtn').addEventListener('click', () => {
    document.getElementById('filterCgpa').value = '';
    document.getElementById('filterBranch').value = '';
    loadStudents();
});

// Load records on page start
loadStudents();
