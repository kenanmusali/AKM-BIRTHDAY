 function createAnniversarySelector() {
            const selectorDiv = document.createElement('div');
            selectorDiv.className = 'anniversary-selector';
            selectorDiv.innerHTML = `
                <h3>Select Anniversary Image (1-11.png)</h3>
                <div class="anniversary-options" id="anniversaryOptions"></div>
            `;

            const existingSelector = document.querySelector('.anniversary-selector');
            if (existingSelector) {
                existingSelector.replaceWith(selectorDiv);
            } else {
                document.getElementById('resultContainer').appendChild(selectorDiv);
            }

            const optionsContainer = document.getElementById('anniversaryOptions');

            // Load preview images (preview1.png to preview11.png)
            for (let i = 1; i <= 11; i++) {
                const option = document.createElement('img');
                option.className = 'anniversary-option';
                option.src = `./assets/img/preview${i}.png`; // Show preview image
                option.dataset.number = i;
                option.onclick = function () {
                    document.querySelectorAll('.anniversary-option').forEach(el => {
                        el.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    // Use the corresponding original image (1.png to 11.png)
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
       