   async function generateFinalImage() {
            if (!canvasBgImage || !selectedAnniversaryImage) return;

            const monthName = document.querySelector('.Section-month')?.textContent;
            const day = document.querySelector('.Section-day')?.textContent;

            try {
                const canvas = document.createElement('canvas');
                canvas.width = canvasBgImage.width;
                canvas.height = canvasBgImage.height;
                const ctx = canvas.getContext('2d');

                // Draw background
                ctx.drawImage(canvasBgImage, 0, 0);

                // Draw month name with rotation
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

                // Add black drop shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.fillText(monthName, 0, 0);

                ctx.restore();

                // Draw day with rotation
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

                // Add black drop shadow for day
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.fillText(day, 0, 0);

                ctx.restore();

                // Reset shadow for employee sections
                ctx.shadowColor = 'transparent';

                // Draw employee sections
                const startX = (canvas.width - 1054) / 2 + currentX;
                const startY = currentY;
                const divWidth = 1054;
                const divHeight = 207;
                const gap = 17;

                for (let i = 0; i < 5; i++) {
                    const employee = birthdayEmployees[i];
                    const y = startY + (i * (divHeight + gap));

                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 5;
                    ctx.globalAlpha = employee ? 1 : 0.5;

                    // Draw rounded rectangle
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

                        // Draw employee name with 4px top margin
                        ctx.fillStyle = '#000000';
                        ctx.font = 'bold 50px Inter';
                        ctx.textAlign = 'left';
                        ctx.fillText(name, startX + 30, y + 70 + 14); // Added 4px top margin

                        // Draw department with 7px top margin
                        ctx.fillStyle = '#000000';
                        ctx.font = '500 47px Inter';

                        // Handle multi-line departments
                        jobLines.forEach((line, j) => {
                            // First line has 7px top margin, subsequent lines follow normal spacing
                            const lineMargin = j === 0 ? 44 : 0;
                            ctx.fillText(line, startX + 30, y + 120 + (j * 45) + lineMargin);
                        });
                    }
                }

                // Draw anniversary image LAST so it appears on top of everything
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
