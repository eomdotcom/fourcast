import { supabase } from './supabase.js';

const fileInput = document.getElementById('file');
const status = document.getElementById('status');

// Automatically upload when a CSV is selected
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  status.textContent = 'Uploading...';

  try {
    // Read CSV
    const result = Papa.parse(await file.text(), {
      header: true,
      skipEmptyLines: true
    });

    if (result.errors.length) {
      throw new Error(result.errors[0].message);
    }

    // Convert empty cells to null
    const records = result.data.map(row => {
      for (const key in row) {
        if (row[key] === '') row[key] = null;
      }
      return row;
    });

    // Upload to Supabase
    const { error } = await supabase
      .from('students')
      .insert(records);

    if (error) throw error;

    status.textContent =
      `Successfully uploaded ${records.length} students!`;

  } catch (error) {
    console.error(error);
    status.textContent = 'Upload failed: ' + error.message;
  }

  fileInput.value = '';
});