import { supabase } from './supabase.js';

let allRows = []; // every row from Supabase, fetched once

const statusEl = document.getElementById('dashboard-status');
const weekButtons = document.getElementById('week-buttons');
const calmList = document.getElementById('calm-students');
const steadyList = document.getElementById('steady-students');
const flareList = document.getElementById('flare-students');

// Turns 5, "5" or "Week 5" into the number 5; blanks become null
function parseWeek(value) {
  if (value === null || value === undefined) return null;
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : null;
}

async function loadStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('student_id, student_name, concern_score, week')
    .order('concern_score', { ascending: false })
    .range(0, 9999);

  // TRACE: remove once it works
  console.log('Rows:', data?.length, 'First row:', data?.[0]);

  if (error) {
    console.error('Error loading students:', error);
    statusEl.textContent = 'Could not load students: ' + error.message;
    return;
  }

  allRows = data;

  // 1. Read every value in the week column, keep unique ones, sort them
  const weeks = [...new Set(
    data.map(row => parseWeek(row.week)).filter(w => w !== null)
  )].sort((a, b) => a - b);

  console.log('Weeks found:', weeks); // TRACE

  if (weeks.length === 0) {
    statusEl.textContent = 'No week values found in the data.';
    return;
  }

  // 2. One button per week
  weekButtons.innerHTML = '';
  weeks.forEach(week => {
    const btn = document.createElement('button');
    btn.textContent = `Week ${week}`;
    btn.dataset.week = week;
    btn.addEventListener('click', () => showWeek(week));
    weekButtons.appendChild(btn);
  });

  // 3. Start on the earliest week
  showWeek(weeks[0]);
}

function showWeek(week) {
  // Highlight the clicked button
  weekButtons.querySelectorAll('button').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.week) === week);
  });

  // Only rows for this week (already sorted by score from Supabase)
  const rows = allRows.filter(row => parseWeek(row.week) === week);

  calmList.innerHTML = '';
  steadyList.innerHTML = '';
  flareList.innerHTML = '';

  let skipped = 0;

  rows.forEach(student => {
    const raw = student.concern_score;
    const score = Number(raw);

    // A blank score must not land in Calm Orbit
    if (raw === null || raw === '' || Number.isNaN(score)) {
      console.warn('No usable concern_score for', student);
      skipped++;
      return;
    }

    const li = document.createElement('li');
    const link = document.createElement('a');
    link.textContent = student.student_name || `Student ${student.student_id}`;
    link.href = `student.html?id=${encodeURIComponent(student.student_id)}&week=${week}`;
    li.appendChild(link);

    if (score <= 30) {
      calmList.appendChild(li);
    } else if (score <= 60) {
      steadyList.appendChild(li);
    } else {
      flareList.appendChild(li);
    }
  });

  statusEl.textContent = `Showing week ${week}: ${rows.length - skipped} students` +
    (skipped ? ` (${skipped} skipped, no score)` : '');
}

loadStudents();