async function loadExcelFiles() {
  const excelFileList = document.getElementById('excelFileList');
  excelFileList.innerHTML = 'Loading available Excel files...';

  try {
    // First fetch the JSON file list
    const listResponse = await fetch('/assets/docs/excel-files.json');
    if (!listResponse.ok) throw new Error('Failed to load file list');
    
    const excelFiles = await listResponse.json();
    excelFileList.innerHTML = '';

    if (excelFiles.length === 0) {
      excelFileList.innerHTML = 'No Excel files found';
      return;
    }

    excelFiles.forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'excel-file-item';
      fileItem.textContent = file;

      fileItem.onclick = async function() {
        document.querySelectorAll('.excel-file-item').forEach(item => {
          item.classList.remove('selected');
        });
        this.classList.add('selected');
        
        try {
          // Update path to use root-relative URL
          const fileUrl = `/assets/docs/${encodeURIComponent(file)}`;
          const fileResponse = await fetch(fileUrl);
          
          if (!fileResponse.ok) throw new Error(`HTTP error! status: ${fileResponse.status}`);
          
          const arrayBuffer = await fileResponse.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          window.currentExcelData = {
            filename: file,
            data: jsonData
          };
          
          excelFileList.innerHTML = `<div class="excel-file-item selected">${file} (loaded)</div>`;
        } catch (error) {
          console.error('Error loading Excel file:', error);
          excelFileList.innerHTML = `<div class="excel-file-item error">Error loading ${file}</div>`;
        }
      };

      excelFileList.appendChild(fileItem);
    });
  } catch (error) {
    excelFileList.innerHTML = 'Error loading file list: ' + error.message;
    console.error('Error:', error);
  }
}
document.addEventListener('DOMContentLoaded', loadExcelFiles);
