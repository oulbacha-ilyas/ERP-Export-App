/**
 * @file cameraViewer.js
 * @description Manages the camera viewer modal, including opening, closing,
 * camera resizing. This version supports
 * multiple, independently draggable and resizable windows.
 */

// camera_viewer.js
export function setupCameraViewer() {
  /*document.addEventListener('DOMContentLoaded', () => {*/
        const openBtn = document.getElementById('open-camera-btn');
        const closeBtn = document.getElementById('close-camera-modal-btn');
        const modal = document.getElementById('camera-modal');
        const header = document.getElementById('camera-modal-header');
        const resizeHandle = document.getElementById('camera-modal-resize-handle');
        const video = document.getElementById('camera-stream');
        const canvas = document.getElementById('camera-canvas');
        const image = document.getElementById('captured-image');
        const captureBtn = document.getElementById('capture-btn');
        const retakeBtn = document.getElementById('retake-btn');
        const errorMessage = document.getElementById('camera-error-message');

        // New AI-related DOM elements
        const analyzeBtn = document.getElementById('analyze-btn');
        const transcribeBtn = document.getElementById('transcribe-btn');
        const resultDisplay = document.getElementById('gemini-result-display');
        const resultText = document.getElementById('gemini-result-text');
        const loadingIndicator = document.getElementById('gemini-loading');

        let isDragging = false;
        let isResizing = false;
        let offsetX, offsetY;
        let currentStream = null;

        // Variables to track the position for the smooth transform
        let posX = 0;
        let posY = 0;

        // --- Gemini API Call Function ---
        async function callGemini(prompt, base64ImageData) {
            loadingIndicator.classList.remove('hidden');
            resultDisplay.classList.remove('hidden');
            resultText.textContent = ''; // Clear previous results

            try {
                const chatHistory = [{
                    role: "user",
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: "image/jpeg", // Use jpeg for better compression
                                data: base64ImageData.split(',')[1] // Extract Base64 data
                            }
                        }
                    ]
                }];

                const payload = { contents: chatHistory };
                const apiKey = "";
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    resultText.textContent = text;
                } else {
                    resultText.textContent = "Je n'ai pas pu générer de réponse. Veuillez réessayer.";
                }

            } catch (error) {
                console.error("Error calling Gemini API:", error);
                resultText.textContent = `Une erreur s'est produite : ${error.message}`;
            } finally {
                loadingIndicator.classList.add('hidden');
            }
        }

        // --- Camera Functionality ---
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                currentStream = stream;
                video.srcObject = stream;
                video.classList.remove('hidden');
                image.classList.add('hidden');
                errorMessage.classList.add('hidden');
                captureBtn.classList.remove('hidden');
                retakeBtn.classList.add('hidden');
                analyzeBtn.classList.add('hidden');
                transcribeBtn.classList.add('hidden');
                resultDisplay.classList.add('hidden');
            } catch (err) {
                console.error("Error accessing the camera:", err);
                video.classList.add('hidden');
                image.classList.add('hidden');
                errorMessage.classList.remove('hidden');
                captureBtn.classList.add('hidden');
                retakeBtn.classList.add('hidden');
            }
        };

        const stopCamera = () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                currentStream = null;
            }
        };

        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            startCamera();
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            stopCamera();
        });

        captureBtn.addEventListener('click', () => {
            if (video.srcObject) {
                const videoWidth = video.videoWidth;
                const videoHeight = video.videoHeight;

                canvas.width = videoWidth;
                canvas.height = videoHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

                const dataURL = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG for smaller size
                image.src = dataURL;

                video.classList.add('hidden');
                image.classList.remove('hidden');
                captureBtn.classList.add('hidden');
                retakeBtn.classList.remove('hidden');
                analyzeBtn.classList.remove('hidden');
                transcribeBtn.classList.remove('hidden');
                stopCamera();
            }
        });

        retakeBtn.addEventListener('click', () => {
            startCamera();
        });

        // --- Gemini Button Event Listeners ---
        analyzeBtn.addEventListener('click', () => {
            const imageDataUrl = image.src;
            if (imageDataUrl) {
                resultDisplay.classList.remove('hidden');
                callGemini("Décrivez le contenu de cette image de manière détaillée.", imageDataUrl);
            }
        });

        transcribeBtn.addEventListener('click', () => {
            const imageDataUrl = image.src;
            if (imageDataUrl) {
                resultDisplay.classList.remove('hidden');
                callGemini("Transcrivez tout le texte visible dans cette image.", imageDataUrl);
            }
        });

        // --- Smooth Dragging Functionality ---
        header.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                isDragging = true;
                offsetX = e.clientX - posX;
                offsetY = e.clientY - posY;
                modal.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                // Update position relative to the last mouse move event
                posX = e.clientX - offsetX;
                posY = e.clientY - offsetY;

                // Apply the transform for smooth movement
                modal.style.transform = `translate(${posX}px, ${posY}px)`;
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            modal.style.cursor = 'auto';
        });

        // --- Resizing Functionality ---
        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (isResizing) {
                // Calculate new size based on mouse position
                const newWidth = e.clientX - modal.getBoundingClientRect().left;
                const newHeight = e.clientY - modal.getBoundingClientRect().top;

                // Check for minimum size before applying
                if (newWidth > 300) {
                    modal.style.width = `${newWidth}px`;
                }
                if (newHeight > 250) {
                    modal.style.height = `${newHeight}px`;
                }
            }
        });

        window.addEventListener('mouseup', () => {
            isResizing = false;
        });

}
