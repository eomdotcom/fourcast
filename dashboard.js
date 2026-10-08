import { supabase } from './supabase.js';

async function loadStudents() {

    // Fetch students from Supabase
    const { data: students, error } = await supabase
        .from('students')
        .select('id, student_name, concern_score, week')
        .order('concern_score', { ascending: false });

    if (error) {
        console.error('Error loading students:', error);
        return;
    }

    // Get category lists
    const calmList = document.getElementById('calm-students');
    const steadyList = document.getElementById('steady-students');
    const flareList = document.getElementById('flare-students');

    // Clear existing lists
    calmList.innerHTML = '';
    steadyList.innerHTML = '';
    flareList.innerHTML = '';

    // Categorise students
    students.forEach(student => {

        const score = Number(student.concern_score);

        // Create clickable student name
        const li = document.createElement('li');
        const link = document.createElement('a');

        link.textContent = student.student_name || `Student ${student.id}`;
        link.href = `student.html?id=${student.id}`;

        li.appendChild(link);

        // Assign category based on report thresholds
        if (score <= 30) {
            calmList.appendChild(li);
        } else if (score <= 60) {
            steadyList.appendChild(li);
        } else {
            flareList.appendChild(li);
        }

    });
}

// Load students when dashboard opens
loadStudents();