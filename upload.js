import { supabase } from './supabase.js';

const fileInput = document.getElementById('file');
const status = document.getElementById('status');
const openBtn = document.getElementById('open-dashboard');
const deleteBtn = document.getElementById('delete-data');

openBtn.addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// Deletes only the rows for the given weeks, so other weeks are kept
async function clearWeeks(weeks) {
  const { error } = await supabase
    .from('students')
    .delete()
    .in('week', weeks);
  if (error) throw error;
}

// Deletes every row. Supabase refuses a delete with no filter,
// so this matches every row that has a student_id.
async function clearAll() {
  const { error } = await supabase
    .from('students')
    .delete()
    .not('student_id', 'is', null);
  if (error) throw error;
}

// Shows how many rows are saved and enables the dashboard button
async function refreshStatus() {
  const { count, error } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });

  if (error) {
    status.textContent = 'Could not check saved data: ' + error.message;
    return;
  }

  if (count > 0) {
    status.textContent = `${count} rows saved in total.`;
    openBtn.disabled = false;
  } else {
    status.textContent = 'No dataset loaded yet.';
    openBtn.disabled = true;
  }
}

// Upload: check the CSV first, then replace only the weeks it contains
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  status.textContent = 'Reading file...';

  try {
    const result = Papa.parse(await file.text(), {
      header: true,
      skipEmptyLines: true
    });

    if (result.errors.length) {
      const e = result.errors[0];
      // +2 = 1 for the header line, 1 because rows count from 0
      const where = e.row !== undefined ? `Line ${e.row + 2}: ` : '';
      throw new Error(where + e.message);
    }

    const records = result.data.map(row => {
      for (const key in row) {
        if (row[key] === '') row[key] = null;
      }
      return row;
    });

    // Check BEFORE deleting anything, so a bad file can't wipe good data
    if (records.length === 0) {
      throw new Error('The CSV has no data rows.');
    }
    if (!('student_id' in records[0]) || !('week' in records[0])) {
      throw new Error('The CSV needs student_id and week columns.');
    }
    if (records.some(r => r.week === null)) {
      throw new Error('Some rows have no week value.');
    }

    // Which weeks does this file contain? e.g. ["3"]
    const weeksInFile = [...new Set(records.map(r => r.week))];

    status.textContent = `Replacing week ${weeksInFile.join(', ')}...`;
    await clearWeeks(weeksInFile);

    const { error } = await supabase.from('students').insert(records);
    if (error) throw error;

    await refreshStatus();
    status.textContent = `Saved ${records.length} rows for week ${weeksInFile.join(', ')}. ` + status.textContent;

  } catch (error) {
    console.error(error);
    status.textContent = 'Upload failed: ' + error.message;
  }

  fileInput.value = '';
});

// Delete button: clears every week
deleteBtn.addEventListener('click', async () => {
  if (!confirm('Delete all student rows from Supabase? This cannot be undone.')) return;

  try {
    await clearAll();
    await refreshStatus();
  } catch (error) {
    console.error(error);
    status.textContent = 'Delete failed: ' + error.message;
  }
});

// On page load, show what's already saved
refreshStatus();