  flatpickr("#datePicker", {
            dateFormat: "d/m",
            enableTime: false,
            noCalendar: false
        });

        let selectedAnniversaryImage = null;
        let canvasBgImage = null;
        let birthdayEmployees = [];
        let currentX = -600;
        let currentY = 531;
        let monthX = 530;
        let monthY = -165;
        let monthRotation = 1.1;
        let dayX = 465;
        let dayY = 71;
        let dayRotation = 1.4;
        let imageZIndex = 999;
        let currentCanvasDataURL = '';













































async function processExcel() {
    const selectedDate = document.getElementById('datePicker').value;
    const fileInput = document.getElementById('excelFile');
    
    if (!selectedDate) {
        alert("Please select a date");
        return;
    }

    // Check if a file was uploaded
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async function(e) {
            const data = new Uint8Array(e.target.result);
            processExcelData(data, selectedDate);
        };

        reader.readAsArrayBuffer(file);
    } 
    // Check if a file was selected from the list
    else if (window.currentExcelData) {
        // Create a mock array buffer from the stored data
        const ws = XLSX.utils.json_to_sheet(window.currentExcelData.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        
        processExcelData(arrayBuffer, selectedDate);
    } 
    // No file selected
    else {
        alert("Please either upload an Excel file or select one from the list");
        return;
    }
}



        
        // Load Excel files when page loads
    

        document.getElementById('processBtn').addEventListener('click', processExcel);

   