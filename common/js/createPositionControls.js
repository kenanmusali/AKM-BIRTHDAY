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
