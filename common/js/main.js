        let currentEmployeeList = [];
        let originalProcessExcelData = null;
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
        
        function waitForProcessExcelData() {
            if (typeof processExcelData !== 'undefined') {
                originalProcessExcelData = processExcelData;
                overrideProcessExcelData();
            } else {
                setTimeout(waitForProcessExcelData, 100);
            }
        }
        
        function overrideProcessExcelData() {
            const newProcessExcelData = async function(arrayBuffer, selectedDate) {
                await originalProcessExcelData(arrayBuffer, selectedDate);
                
                extractEmployeesFromResultContainer();
                
                displayEmployeeList();
                createManualAddSection();
            };
            
            window.processExcelData = newProcessExcelData;
        }
        
        function extractEmployeesFromResultContainer() {
            const resultContainer = document.getElementById('resultContainer');
            if (!resultContainer) return;
            
            const sections = resultContainer.querySelectorAll('.section-div:not(.empty)');
            
            currentEmployeeList = [];
            
            sections.forEach(section => {
                const nameElement = section.querySelector('h3');
                const departmentElement = section.querySelector('div');
                
                if (nameElement && departmentElement) {
                    const name = nameElement.textContent;
                    const department = departmentElement.innerHTML.replace(/<br\s*\/?>/gi, ' ');
                    
                    currentEmployeeList.push({
                        'ссылка': name,
                        'Department': department
                    });
                }
            });
            console.log('Extracted employees:', currentEmployeeList);
        }
        
        function displayEmployeeList() {
            const resultDiv = document.getElementById('result');
            if (!resultDiv) return;
            
            resultDiv.innerHTML = '';
            
            createManualAddSection();
            
            if (!currentEmployeeList || currentEmployeeList.length === 0) {
                resultDiv.innerHTML += '<p>No employees found. Process an Excel file first or add employees manually.</p>';
                return;
            }
            
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'employee-controls';
            
            const title = document.createElement('h3');
            title.textContent = 'Employee List (Drag to reorder)';
            controlsContainer.appendChild(title);
            
            const listContainer = document.createElement('div');
            listContainer.className = 'employee-list';
            listContainer.id = 'employeeList';
            
            currentEmployeeList.forEach((employee, index) => {
                const employeeItem = document.createElement('div');
                employeeItem.className = 'employee-item';
                employeeItem.dataset.index = index;
                employeeItem.draggable = true;
                
                const name = fixTurkishCharacters(employee.ссылка);
                const jobOriginal = fixTurkishCharacters(employee.Department || '').trim();
                const jobLines = transformDepartment(jobOriginal);
                
                employeeItem.innerHTML = `
                    <span class="drag-handle">☰</span>
                    <div class="employee-info">
                        <strong>${name || 'Name not available'}</strong>
                        <div>${jobLines.join(' - ')}</div>
                    </div>
                    <div class="employee-actions">
                        <button class="btn btn-up" onclick="moveEmployeeUp(${index})" ${index === 0 ? 'disabled' : ''}>↑</button>
                        <button class="btn btn-down" onclick="moveEmployeeDown(${index})" ${index === currentEmployeeList.length - 1 ? 'disabled' : ''}>↓</button>
                        <button class="btn btn-delete" onclick="deleteEmployee(${index})">Delete</button>
                    </div>
                `;
                
                // Add drag events
                employeeItem.addEventListener('dragstart', handleDragStart);
                employeeItem.addEventListener('dragover', handleDragOver);
                employeeItem.addEventListener('drop', handleDrop);
                employeeItem.addEventListener('dragend', handleDragEnd);
                
                listContainer.appendChild(employeeItem);
            });
            
            controlsContainer.appendChild(listContainer);
            resultDiv.appendChild(controlsContainer);
            
            resultDiv.style.display = 'block';
            resultDiv.style.visibility = 'visible';
            
            console.log('Employee list displayed');
        }

        function createManualAddSection() {
            const resultDiv = document.getElementById('result');
            if (!resultDiv) return;
            
            let manualAddSection = document.querySelector('.manual-add-section');
            
            if (!manualAddSection) {
                manualAddSection = document.createElement('div');
                manualAddSection.className = 'manual-add-section';
                manualAddSection.innerHTML = `
                    <h3>Add Employee Manually</h3>
                    <div class="form-group">
                        <label for="employeeName">Employee Name</label>
                        <input type="text" id="employeeName" placeholder="Enter employee name">
                    </div>
                    <div class="form-group">
                        <label for="employeeDepartment">Department</label>
                        <input type="text" id="employeeDepartment" placeholder="Enter department">
                    </div>
                    <button class="manual-add-btn" id="addEmployeeBtn">Add Employee to Canvas</button>
                `;
                
                resultDiv.insertBefore(manualAddSection, resultDiv.firstChild);
                
                document.getElementById('addEmployeeBtn').addEventListener('click', addEmployeeManually);
            }
        }

        function addEmployeeManually() {
            const nameInput = document.getElementById('employeeName');
            const departmentInput = document.getElementById('employeeDepartment');
            
            const name = nameInput.value.trim();
            const department = departmentInput.value.trim();
            
            if (!name) {
                alert('Please enter an employee name');
                return;
            }
            
            currentEmployeeList.push({
                'ссылка': name,
                'Department': department
            });
            
            nameInput.value = '';
            departmentInput.value = '';
            
            updateUI();
            
            console.log('Added employee manually:', name, department);
        }

        let draggedItem = null;

        function handleDragStart(e) {
            draggedItem = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.dataset.index);
            this.style.opacity = '0.5';
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            return false;
        }

        function handleDrop(e) {
            e.preventDefault();
            if (draggedItem !== this) {
                const fromIndex = parseInt(draggedItem.dataset.index);
                const toIndex = parseInt(this.dataset.index);
                
                const [movedItem] = currentEmployeeList.splice(fromIndex, 1);
                currentEmployeeList.splice(toIndex, 0, movedItem);
                
                updateUI();
            }
            return false;
        }

        function handleDragEnd(e) {
            this.style.opacity = '1';
        }

        function moveEmployeeUp(index) {
            if (index <= 0) return;
            
            [currentEmployeeList[index], currentEmployeeList[index - 1]] = 
            [currentEmployeeList[index - 1], currentEmployeeList[index]];
            
            updateUI();
        }

        function moveEmployeeDown(index) {
            if (index >= currentEmployeeList.length - 1) return;
            
            [currentEmployeeList[index], currentEmployeeList[index + 1]] = 
            [currentEmployeeList[index + 1], currentEmployeeList[index]];
            
            updateUI();
        }

        function deleteEmployee(index) {
            currentEmployeeList.splice(index, 1);
            
            updateUI();
        }

        function updateUI() {
            displayEmployeeList();
            
            updateSectionContainer();
            
            if (typeof generateFinalImage === 'function') {
                generateFinalImage();
            }
        }

        function updateSectionContainer() {
            const resultContainer = document.getElementById('resultContainer');
            if (!resultContainer) return;
            
            const sectionContainer = resultContainer.querySelector('.section-container');
            
            if (!sectionContainer) {
                console.error('Section container not found');
                return;
            }
            
            sectionContainer.innerHTML = '';
            
            for (let i = 0; i < 5; i++) {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'section-div' + (i >= currentEmployeeList.length ? ' empty' : '');
                sectionDiv.id = `section-${i + 1}`;

                if (i < currentEmployeeList.length) {
                    const employee = currentEmployeeList[i];
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
            
            console.log('Section container updated');
        }
        
        window.moveEmployeeUp = moveEmployeeUp;
        window.moveEmployeeDown = moveEmployeeDown;
        window.deleteEmployee = deleteEmployee;
        window.addEmployeeManually = addEmployeeManually;
        
        waitForProcessExcelData();

        function createAnniversarySelector() {
            const selectorDiv = document.createElement('div');
            selectorDiv.className = 'anniversary-selector';
            selectorDiv.innerHTML = `
                <h3>Select Anniversary Image (1-12.png)</h3>
                <div class="anniversary-options" id="anniversaryOptions"></div>
            `;

            const existingSelector = document.querySelector('.anniversary-selector');
            if (existingSelector) {
                existingSelector.replaceWith(selectorDiv);
            } else {
                document.getElementById('resultContainer').appendChild(selectorDiv);
            }

            const optionsContainer = document.getElementById('anniversaryOptions');

            for (let i = 1; i <= 12; i++) {
                const option = document.createElement('img');
                option.className = 'anniversary-option';
                option.src = `./assets/img/preview${i}.png`; // Show preview image
                option.dataset.number = i;
                option.onclick = function () {
                    document.querySelectorAll('.anniversary-option').forEach(el => {
                        el.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    selectedAnniversaryImage = `./assets/img/${i}.png`;
                    generateFinalImage();
                };
                option.onerror = function () {
                    this.remove();
                };

                optionsContainer.appendChild(option);
            }

            // Select the first image by default if available
            if (optionsContainer.firstChild) {
                optionsContainer.firstChild.click();
            }
        }

        function createPositionControls() {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'position-controls';
            controlsDiv.innerHTML = `
                <h3>Adjust Employee Sections Position</h3>
                <div style="display: flex; gap: 15px; margin-top: 10px;">
                    <div class="control-group">
                        <label>Horizontal (X)</label>
                        <input type="range" id="xPosition" min="-600" max="200" value="${currentX}" style="width: 200px;">
                        <span id="xValue">${currentX}px</span>
                    </div>
                    <div class="control-group">
                        <label>Vertical (Y)</label>
                        <input type="range" id="yPosition" min="100" max="600" value="${currentY}" style="width: 200px;">
                        <span id="yValue">${currentY}px</span>
                    </div>
                    <button id="resetPosition">Reset</button>
                </div>
            `;

            const existingControls = document.querySelector('.position-controls');
            if (existingControls) {
                existingControls.replaceWith(controlsDiv);
            } else {
                document.getElementById('resultContainer').appendChild(controlsDiv);
            }

            const xSlider = document.getElementById('xPosition');
            const ySlider = document.getElementById('yPosition');
            const xValue = document.getElementById('xValue');
            const yValue = document.getElementById('yValue');
            const resetBtn = document.getElementById('resetPosition');

            xSlider.addEventListener('input', function () {
                currentX = parseInt(this.value);
                xValue.textContent = `${currentX}px`;
                generateFinalImage();
            });

            ySlider.addEventListener('input', function () {
                currentY = parseInt(this.value);
                yValue.textContent = `${currentY}px`;
                generateFinalImage();
            });

            resetBtn.addEventListener('click', function () {
                currentX = -600;
                currentY = 531;
                xSlider.value = currentX;
                ySlider.value = currentY;
                xValue.textContent = `${currentX}px`;
                yValue.textContent = `${currentY}px`;
                generateFinalImage();
            });
        }

        function createTextPositionControls() {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'text-position-controls';
            controlsDiv.innerHTML = `
                <h3>Adjust Text Position</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px;">
                    <div class="control-group">
                        <label>Month X Position</label>
                        <input type="range" id="monthX" min="-800" max="800" value="${monthX}" style="width: 200px;">
                        <span id="monthXValue">${monthX}px</span>
                    </div>
                    <div class="control-group">
                        <label>Month Y Position</label>
                        <input type="range" id="monthY" min="-800" max="800" value="${monthY}" style="width: 200px;">
                        <span id="monthYValue">${monthY}px</span>
                    </div>
                    <div class="control-group">
                        <label>Month Rotation</label>
                        <input type="range" id="monthRotation" min="-10" max="10" step="0.1" value="${monthRotation}" style="width: 200px;">
                        <span id="monthRotationValue">${monthRotation}°</span>
                    </div>
                    <div class="control-group">
                        <label>Day X Position</label>
                        <input type="range" id="dayX" min="-800" max="800" value="${dayX}" style="width: 200px;">
                        <span id="dayXValue">${dayX}px</span>
                    </div>
                    <div class="control-group">
                        <label>Day Y Position</label>
                        <input type="range" id="dayY" min="-1300" max="1300" value="${dayY}" style="width: 200px;">
                        <span id="dayYValue">${dayY}px</span>
                    </div>
                    <div class="control-group">
                        <label>Day Rotation</label>
                        <input type="range" id="dayRotation" min="-10" max="10" step="0.1" value="${dayRotation}" style="width: 200px;">
                        <span id="dayRotationValue">${dayRotation}°</span>
                    </div>
                    <button id="resetTextPosition">Reset Text</button>
                </div>
            `;

            const existingControls = document.querySelector('.text-position-controls');
            if (existingControls) {
                existingControls.replaceWith(controlsDiv);
            } else {
                document.getElementById('resultContainer').appendChild(controlsDiv);
            }

            const monthXSlider = document.getElementById('monthX');
            const monthYSlider = document.getElementById('monthY');
            const monthRotationSlider = document.getElementById('monthRotation');
            const dayXSlider = document.getElementById('dayX');
            const dayYSlider = document.getElementById('dayY');
            const dayRotationSlider = document.getElementById('dayRotation');
            const monthXValue = document.getElementById('monthXValue');
            const monthYValue = document.getElementById('monthYValue');
            const monthRotationValue = document.getElementById('monthRotationValue');
            const dayXValue = document.getElementById('dayXValue');
            const dayYValue = document.getElementById('dayYValue');
            const dayRotationValue = document.getElementById('dayRotationValue');
            const resetBtn = document.getElementById('resetTextPosition');

            monthXSlider.addEventListener('input', function () {
                monthX = parseInt(this.value);
                monthXValue.textContent = `${monthX}px`;
                generateFinalImage();
            });

            monthYSlider.addEventListener('input', function () {
                monthY = parseInt(this.value);
                monthYValue.textContent = `${monthY}px`;
                generateFinalImage();
            });

            monthRotationSlider.addEventListener('input', function () {
                monthRotation = parseFloat(this.value);
                monthRotationValue.textContent = `${monthRotation}°`;
                generateFinalImage();
            });

            dayXSlider.addEventListener('input', function () {
                dayX = parseInt(this.value);
                dayXValue.textContent = `${dayX}px`;
                generateFinalImage();
            });

            dayYSlider.addEventListener('input', function () {
                dayY = parseInt(this.value);
                dayYValue.textContent = `${dayY}px`;
                generateFinalImage();
            });

            dayRotationSlider.addEventListener('input', function () {
                dayRotation = parseFloat(this.value);
                dayRotationValue.textContent = `${dayRotation}°`;
                generateFinalImage();
            });

            resetBtn.addEventListener('click', function () {
                monthX = 530;
                monthY = -165;
                monthRotation = 1.1;
                dayX = 465;
                dayY = 71;

                const monthName = document.querySelector('.Section-month')?.textContent;
                const highRotationMonths = ["YANVAR", "FEVRAL", "AVQUST", "SENTYABR", "OKTYABR", "NOYABR", "DEKABR"];
                const lowRotationMonths = ["MART", "APREL", "MAY", "İYUN", "İYUL"];

                if (highRotationMonths.includes(monthName)) {
                    dayRotation = 1.4;
                } else if (lowRotationMonths.includes(monthName)) {
                    dayRotation = 1.8;
                } else {
                    dayRotation = 1.4; // Default
                }

                monthXSlider.value = monthX;
                monthYSlider.value = monthY;
                monthRotationSlider.value = monthRotation;
                dayXSlider.value = dayX;
                dayYSlider.value = dayY;
                dayRotationSlider.value = dayRotation;
                monthXValue.textContent = `${monthX}px`;
                monthYValue.textContent = `${monthY}px`;
                monthRotationValue.textContent = `${monthRotation}°`;
                dayXValue.textContent = `${dayX}px`;
                dayYValue.textContent = `${dayY}px`;
                dayRotationValue.textContent = `${dayRotation}°`;
                generateFinalImage();
            });
        }

        function fixTurkishCharacters(text) {
            if (!text) return text;
            const replacements = {
                'İ': 'İ',
                'ı': 'ı',
                'i': 'i',
                'ğ': 'ğ',
                'Ğ': 'Ğ',
                'ş': 'ş',
                'Ş': 'Ş',
                'ü': 'ü',
                'Ü': 'Ü',
                'ö': 'ö',
                'Ö': 'Ö',
                'ç': 'ç',
                'Ç': 'Ç'
            };

            return text.replace(/[İıiğĞşŞüÜöÖçÇ]/g, char => replacements[char] || char);
        }

        async function generateFinalImage() {
            if (!canvasBgImage || !selectedAnniversaryImage) return;

            const monthName = document.querySelector('.Section-month')?.textContent;
            const day = document.querySelector('.Section-day')?.textContent;

            try {
                const canvas = document.createElement('canvas');
                canvas.width = canvasBgImage.width;
                canvas.height = canvasBgImage.height;
                const ctx = canvas.getContext('2d');

                ctx.drawImage(canvasBgImage, 0, 0);

                ctx.save();
                ctx.translate(canvas.width / 2 + monthX, canvas.height / 2 + monthY);
                ctx.rotate(monthRotation * Math.PI / 180);

                ctx.fillStyle = '#016EE2';
                ctx.font = 'italic 900 111px Inter';
                ctx.textAlign = 'center';
                ctx.shadowColor = '#0346B8';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;
                ctx.fillText(monthName, 0, 0);

                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.fillText(monthName, 0, 0);

                ctx.restore();

                ctx.save();
                ctx.translate(canvas.width / 2 + dayX, canvas.height / 2 + dayY);
                ctx.rotate(dayRotation * Math.PI / 180);

                ctx.fillStyle = '#016EE2';
                ctx.font = 'italic 900 455.5px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = '#0346B8';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 7;
                ctx.shadowOffsetY = 7;
                ctx.fillText(day, 0, 0);

                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.fillText(day, 0, 0);

                ctx.restore();

                ctx.shadowColor = 'transparent';

                const startX = (canvas.width - 1054) / 2 + currentX;
                const startY = currentY;
                const divWidth = 1054;
                const divHeight = 207;
                const gap = 17;

                for (let i = 0; i < 5; i++) {
                    const employee = currentEmployeeList[i];
                    const y = startY + (i * (divHeight + gap));

                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 5;
                    ctx.globalAlpha = employee ? 1 : 0.5;

                    ctx.beginPath();
                    ctx.moveTo(startX + 18, y);
                    ctx.lineTo(startX + divWidth - 18, y);
                    ctx.quadraticCurveTo(startX + divWidth, y, startX + divWidth, y + 18);
                    ctx.lineTo(startX + divWidth, y + divHeight - 18);
                    ctx.quadraticCurveTo(startX + divWidth, y + divHeight, startX + divWidth - 18, y + divHeight);
                    ctx.lineTo(startX + 18, y + divHeight);
                    ctx.quadraticCurveTo(startX, y + divHeight, startX, y + divHeight - 18);
                    ctx.lineTo(startX, y + 18);
                    ctx.quadraticCurveTo(startX, y, startX + 18, y);
                    ctx.closePath();
                    ctx.fill();

                    ctx.shadowColor = 'transparent';
                    ctx.globalAlpha = 1;

                    if (employee) {
                        const name = fixTurkishCharacters(employee.ссылка) || 'Name not available';
                        const jobOriginal = fixTurkishCharacters(employee.Department || '').trim();
                        const jobLines = transformDepartment(jobOriginal);

                        ctx.fillStyle = '#000000';
                        ctx.font = 'bold 50px Inter';
                        ctx.textAlign = 'left';
                        ctx.fillText(name, startX + 30, y + 70 + 14); // Added 4px top margin

                        ctx.fillStyle = '#000000';
                        ctx.font = '500 47px Inter';

                        jobLines.forEach((line, j) => {
                            const lineMargin = j === 0 ? 44 : 0;
                            ctx.fillText(line, startX + 30, y + 120 + (j * 45) + lineMargin);
                        });
                    }
                }

                const anniversaryImg = await loadImage(selectedAnniversaryImage);
                ctx.drawImage(anniversaryImg, 0, 0, canvas.width, canvas.height);

                currentCanvasDataURL = canvas.toDataURL('image/png');

                const previewContainer = document.createElement('div');
                previewContainer.className = 'preview-container';

                const previewImg = document.createElement('img');
                previewImg.className = 'preview-image';
                previewImg.src = currentCanvasDataURL;

                const buttonGroup = document.createElement('div');
                buttonGroup.className = 'button-group';

                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'download-btn';
                downloadBtn.textContent = 'Download Birthday Post';
                downloadBtn.onclick = () => {
                    const link = document.createElement('a');
                    link.download = `Birthday_${monthName}_${day}.png`;
                    link.href = currentCanvasDataURL;
                    link.click();
                };

                buttonGroup.appendChild(downloadBtn);

                document.querySelector('.preview-container')?.remove();
                previewContainer.appendChild(previewImg);
                previewContainer.appendChild(buttonGroup);

                const positionControls = document.querySelector('.position-controls');
                if (positionControls) {
                    positionControls.after(previewContainer);
                } else {
                    document.getElementById('resultContainer').appendChild(previewContainer);
                }

            } catch (error) {
                console.error("Error generating final image:", error);
                alert("Error generating final image. Please check console for details.");
            }
        }

        async function loadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = () => resolve(img);
                img.onerror = (e) => {
                    console.error("Error loading image:", src, e);
                    reject(new Error(`Failed to load image: ${src}`));
                };
                img.src = src;
            });
        }

        async function loadExcelFiles() {
            const excelFileList = document.getElementById('excelFileList');
            excelFileList.innerHTML = 'Loading available Excel files...';

            try {
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

                    fileItem.onclick = async function () {
                        document.querySelectorAll('.excel-file-item').forEach(item => {
                            item.classList.remove('selected');
                        });
                        this.classList.add('selected');

                        try {
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

        async function processExcel() {
            const selectedDate = document.getElementById('datePicker').value;
            const fileInput = document.getElementById('excelFile');

            if (!selectedDate) {
                alert("Please select a date");
                return;
            }

            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();

                reader.onload = async function (e) {
                    const data = new Uint8Array(e.target.result);
                    processExcelData(data, selectedDate);
                };

                reader.readAsArrayBuffer(file);
            }
            else if (window.currentExcelData) {
                const ws = XLSX.utils.json_to_sheet(window.currentExcelData.data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

                processExcelData(arrayBuffer, selectedDate);
            }
            else {
                alert("Please either upload an Excel file or select one from the list");
                return;
            }
        }

        async function processExcelData(arrayBuffer, selectedDate) {
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            const resultContainer = document.getElementById('resultContainer');

            const elementsToRemove = document.querySelectorAll('.preview-container, .month-day-display, .employee-list, .section-container');
            elementsToRemove.forEach(el => el.remove());

            const [selectedDay, selectedMonth] = selectedDate.split('/').map(Number);

            birthdayEmployees = jsonData.filter(row => {
                if (!row.ДатаР2) return false;

                const dateStr = row.ДатаР2.toString().trim();

                let day, month;

                if (dateStr.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
                    const parts = dateStr.split('.');
                    day = parseInt(parts[0], 11);
                    month = parseInt(parts[1], 10);
                }
                else if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                    const parts = dateStr.split('-');
                    day = parseInt(parts[2], 11);
                    month = parseInt(parts[1], 11);
                }
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
                const aName = (a.ссылка || '').toString().toLowerCase();
                const bName = (b.ссылка || '').toString().toLowerCase();

                const aHasQizi = aName.endsWith('qızı');
                const bHasQizi = bName.endsWith('qızı');

                if (aHasQizi && !bHasQizi) return -1;
                if (!aHasQizi && bHasQizi) return 1;
                return 0;  
            });

            currentEmployeeList = [...birthdayEmployees];

            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'section-container';

            for (let i = 0; i < 5; i++) {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'section-div' + (i >= currentEmployeeList.length ? ' empty' : '');
                sectionDiv.id = `section-${i + 1}`;

                if (i < currentEmployeeList.length) {
                    const employee = currentEmployeeList[i];
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

            if (currentEmployeeList.length === 0) {
                resultContainer.innerHTML += '<p>No employees found with birthdays on this date</p>';
                return;
            }

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

            const highRotationMonths = ["YANVAR", "FEVRAL", "AVQUST", "SENTYABR", "OKTYABR", "NOYABR", "DEKABR"];
            const lowRotationMonths = ["MART", "APREL", "MAY", "İYUN", "İYUL"];

            if (highRotationMonths.includes(monthName)) {
                dayRotation = 1.4;
            } else if (lowRotationMonths.includes(monthName)) {
                dayRotation = 1.8;
            }

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

        function transformDepartment(jobOriginal) {
            const jobReplaceList = [
                "BBGİ ofisi",
                "Bəyannamə bölməsi",
                "Gömrük təmsilçiliyi bölməsi",
                "HNBGİ ofisi",
                "Koordinasiya şöbəsi",
                "Koordinasiya şöbəsi / Sertifikatlaşdırma bölməsi",
                "Mühasibatlıq şöbəsi",
                "MB Broker",
                "Əməliyyat şöbəsi",
                "Mühasibatlıq şöbəsi / Kassa - hesablaşmalar bölməsi",
                "Satış şöbəsi",
            ];

            if (jobOriginal === "TIR Park və minik avtomobillərinin dayanacağı şöbəsi") {
                return ["TIR Park və m. a. dayanacağı şöbəsi"];
            } else if (jobOriginal.startsWith("DDD / Daxili daşımalar departamenti")) {
                return ["Daxili daşımalar departamenti"];
            } else if (jobOriginal.startsWith("Təhlükəsizlik şöbəsi / Elektrik təminatı və Təmir bölməsi")) {
                return ["Təhlükəsizlik şöbəsi"];
            } else if (jobOriginal.startsWith("ƏKTD / Sistem əməliyyaları şöbəsi (UDPAS)")) {
                return ["ƏKTD / Sistem əməliyyaları şöbəsi"];
            } else if (jobOriginal.startsWith("İRİD/İstedadların cəlbi və idarə olunması şöbəsi")) {
                return ["İRİD / İstedadların cəlbi və idarə olunması Ş."];
            } else if (jobOriginal.startsWith("ƏKTD / Anbar əməliyyatları şöbəsi (WMS)")) {
                return ["ƏKTD / Anbar əməliyyatları şöbəsi"];
            } else if (jobOriginal.startsWith("Əməliyyat şöbəsi")) {
                return ["Abşeron Express"];
            } else if (jobOriginal.startsWith("İRİD / İnsan resursları və inzibati departament")) {
                return ["İRİD / İnsan resursları və inzibati D."];
            } else if (jobOriginal.startsWith("LİOD / Layihələrin təşkili və monitorinqi şöbəsi")) {
                return ["LİOD / Layihələrin təşkili və monitorinqi Ş."];
            } else if (jobReplaceList.some(prefix => jobOriginal.startsWith(prefix))) {
                return ["MB BROKER"];
            } else {
                return [jobOriginal];
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            flatpickr("#datePicker", {
                dateFormat: "d/m",
                enableTime: false,
                noCalendar: false
            });

            document.getElementById('processBtn').addEventListener('click', processExcel);
            loadExcelFiles();
        });