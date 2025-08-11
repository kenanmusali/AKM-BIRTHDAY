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

                // Reset day rotation based on month
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
