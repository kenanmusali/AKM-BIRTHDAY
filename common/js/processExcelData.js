async function processExcelData(arrayBuffer, selectedDate) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

    const resultContainer = document.getElementById('resultContainer');

    // Clear only the preview and employee data, keep controls
    const elementsToRemove = document.querySelectorAll('.preview-container, .month-day-display, .employee-list, .section-container');
    elementsToRemove.forEach(el => el.remove());

    // Get selected date parts
    const [selectedDay, selectedMonth] = selectedDate.split('/').map(Number);

    // Filter and sort employees - those with "qızı" in name come first
    birthdayEmployees = jsonData.filter(row => {
        if (!row.ДатаР2) return false;

        // Convert to string in case it's a date object or number
        const dateStr = row.ДатаР2.toString().trim();

        // Handle different date formats
        let day, month;

        // Format: DD.MM.YYYY (14.06.1980)
        if (dateStr.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
            const parts = dateStr.split('.');
            day = parseInt(parts[0], 11);
            month = parseInt(parts[1], 10);
        }
        // Format: YYYY-MM-DD (if dates come as ISO strings)
        else if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
            const parts = dateStr.split('-');
            day = parseInt(parts[2], 11);
            month = parseInt(parts[1], 11);
        }
        // If it's an Excel serial date number (unlikely but possible)
        else if (!isNaN(dateStr)) {
            const date = new Date((parseFloat(dateStr) - 25569) * 86400 * 1000);
            day = date.getDate();
            month = date.getMonth() + 1;
        } else {
            console.warn("Unrecognized date format:", dateStr);
            return false;
        }

        return day === selectedDay && month === selectedMonth;
    }).sort((a, b) => {
        // Check if name ends with "qızı" (case insensitive)
        const aName = (a.ссылка || '').toString().toLowerCase();
        const bName = (b.ссылка || '').toString().toLowerCase();

        const aHasQizi = aName.endsWith('qızı');
        const bHasQizi = bName.endsWith('qızı');

        if (aHasQizi && !bHasQizi) return -1;
        if (!aHasQizi && bHasQizi) return 1;
        return 0; // Keep original order if both have or don't have "qızı"
    });

    // Rest of your existing processing code...
    // Create and populate section divs
    const sectionContainer = document.createElement('div');
    sectionContainer.className = 'section-container';

    for (let i = 0; i < 5; i++) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section-div' + (i >= birthdayEmployees.length ? ' empty' : '');
        sectionDiv.id = `section-${i + 1}`;

        if (i < birthdayEmployees.length) {
            const employee = birthdayEmployees[i];
            const name = fixTurkishCharacters(employee.ссылка);
            const jobOriginal = fixTurkishCharacters(employee.Department || '').trim();
            const jobLines = transformDepartment(jobOriginal);

            sectionDiv.innerHTML = `
                <h3>${name || 'Name not available'}</h3>
                <div>${jobLines.join('<br>')}</div>
            `;
        } else {
            sectionDiv.innerHTML = `<h3>Section ${i + 1}</h3>`;
        }

        sectionContainer.appendChild(sectionDiv);
    }

    resultContainer.appendChild(sectionContainer);

    if (birthdayEmployees.length === 0) {
        resultContainer.innerHTML += '<p>No employees found with birthdays on this date</p>';
        return;
    }

    // Display month and day
    const monthNames = ["YANVAR", "FEVRAL", "MART", "APREL", "MAY", "İYUN",
        "İYUL", "AVQUST", "SENTYABR", "OKTYABR", "NOYABR", "DEKABR"];
    const monthName = monthNames[selectedMonth - 1];

    const monthDayDisplay = document.createElement('div');
    monthDayDisplay.className = 'month-day-display';
    monthDayDisplay.innerHTML = `
        <div class="Section-month">${monthName}</div>
        <div class="Section-day">${selectedDay}</div>
    `;
    resultContainer.appendChild(monthDayDisplay);

    // Set day rotation based on month
    const highRotationMonths = ["YANVAR", "FEVRAL", "AVQUST", "SENTYABR", "OKTYABR", "NOYABR", "DEKABR"];
    const lowRotationMonths = ["MART", "APREL", "MAY", "İYUN", "İYUL"];

    if (highRotationMonths.includes(monthName)) {
        dayRotation = 1.4;
    } else if (lowRotationMonths.includes(monthName)) {
        dayRotation = 1.8;
    }

    // Create anniversary selector and position controls
    createAnniversarySelector();
    createPositionControls();
    createTextPositionControls();

    try {
        canvasBgImage = await loadImage('./assets/img/canva.png');
        generateFinalImage();
    } catch (error) {
        console.error("Error loading canvas background:", error);
        alert("Failed to load canvas background image");
    }
}

