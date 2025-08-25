/**
 * @file cameraModal.js
 * @description Manages the camera modal functionality, including opening,
 * closing, camera stream control, taking photos, and Gemini API calls.
 */
import { makeDraggableAndResizable } from './modals.js';
import { unloadComponent,isComponentLoaded, getLoadedComponent} from './componentLoader.js';

/**
 * Initializes all event listeners and functionality for the camera modal.
 * This function should be called after the camera modal's HTML has been
 * dynamically loaded into the DOM.
 */
export function setupCameraModal(componentId,componentCounter) {
    // --- DOM Elements ---
    const modal = document.getElementById(`${componentId}-${componentCounter}`);
    const closeBtn = document.querySelector(`#close-camera-modal-btn-${componentCounter}`);
    const header = document.querySelector(`#camera-modal-header-${componentCounter}`);
    const footer = document.querySelector(`#camera-modal-footer-${componentCounter}`);
    const leftHandle = document.querySelector(`#camera-modal-left-handle-${componentCounter}`);
    const rightHandle = document.querySelector(`#camera-modal-right-handle-${componentCounter}`);
    const resizeHandle = document.querySelector(`#camera-modal-resize-handle-${componentCounter}`);
    const video = document.querySelector(`#camera-stream-${componentCounter}`);
    const canvas = document.querySelector(`#camera-canvas-${componentCounter}`);
    const image = document.querySelector(`#captured-image-${componentCounter}`);
    const captureBtn = document.querySelector(`#capture-btn-${componentCounter}`);
    const retakeBtn = document.querySelector(`#retake-btn-${componentCounter}`);
    const errorMessage = document.querySelector(`#camera-error-message-${componentCounter}`);
    const analyzeBtn = document.querySelector(`#analyze-btn-${componentCounter}`);
    const transcribeBtn = document.querySelector(`#transcribe-btn-${componentCounter}`);
    const resultDisplay = document.querySelector(`#gemini-result-display-${componentCounter}`);
    const resultText = document.querySelector(`#gemini-result-text-${componentCounter}`);
    const loadingIndicator = document.querySelector(`#gemini-loading-${componentCounter}`);

    // The openBtn is not needed here; it's handled by index.js
    // const openBtn = document.getElementById('open-camera-btn');

    // --- State Variables ---
    let currentStream = null;

    // --- Core Functions ---
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
                    { inlineData: { mimeType: "image/jpeg", data: base64ImageData.split(',')[1] } }
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

    // --- Modal Control Functions (the new public API) ---
    const openCameraModal = () => {
        modal.classList.remove('hidden');
        startCamera();
    };

    const closeCameraModal = () => {
        modal.classList.add('hidden');
        unloadComponent(modal.id);
        stopCamera();
    };

    // --- Event Listeners ---
    // The open button listener is now managed in index.js
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCameraModal);
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            if (video.srcObject) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
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
    }

    if (retakeBtn) {
        retakeBtn.addEventListener('click', () => {
            startCamera();
        });
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const imageDataUrl = image.src;
            if (imageDataUrl) {
                resultDisplay.classList.remove('hidden');
                callGemini("Décrivez le contenu de cette image de manière détaillée.", imageDataUrl);
            }
        });
    }

    if (transcribeBtn) {
        transcribeBtn.addEventListener('click', () => {
            const imageDataUrl = image.src;
            if (imageDataUrl) {
                resultDisplay.classList.remove('hidden');
                callGemini("Transcrivez tout le texte visible dans cette image.", imageDataUrl);
            }
        });
    }

    // Apply the drag and resize functionality from the modals.js module
    if (modal && header && resizeHandle) {
        makeDraggableAndResizable(modal, header,footer,leftHandle,rightHandle, resizeHandle);
    }

    // Return the public API for the component. This is the crucial step.
    return {
        open: openCameraModal,
        close: closeCameraModal
    };
}
