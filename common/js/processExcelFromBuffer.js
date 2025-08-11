async function processExcelFromBuffer(arrayBuffer, filename) {
  try {
    console.log(`Processing Excel file: ${filename}`);
    // Add your Excel processing logic here
    // Example using SheetJS:
    // const workbook = XLSX.read(arrayBuffer, {type: 'array'});
    // const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    // const data = XLSX.utils.sheet_to_json(firstSheet);
    // Process your data here...
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
}
