/**
 * @file docViewerModal.js
 * @description Manages the file viewer modal, including opening, closing,
 * file selection, and previewing images and PDFs. This version supports
 * multiple, independently draggable and resizable windows.
 */

import { makeDraggableAndResizable } from './modals.js';

export function setupDocViewerModal() {
    const openBtn = document.getElementById('open-viewer-btn');
    if (!openBtn) {
        console.error("Open viewer button not found.");
        return;
    }
    let windowCount = 0;

    openBtn.addEventListener('click', () => {
        windowCount++;
        const uniqueId = `docViewerModal-${windowCount}`;
        const newModal = createModalElement(uniqueId);
        document.body.appendChild(newModal);

        // Get the elements with their unique IDs
        const closeBtn = document.getElementById(`close-modal-btn-${uniqueId}`);
        const modalHeader = document.getElementById(`modal-header-${uniqueId}`);
        const modalFooter = document.getElementById(`docViewerModal-footer-${uniqueId}`);
        const leftHandle = document.getElementById(`docViewerModal-left-handle-${uniqueId}`);
        const rightHandle = document.getElementById(`docViewerModal-right-handle-${uniqueId}`);
        const resizeHandle = document.getElementById(`resize-handle-${uniqueId}`);
        const fileInput = document.getElementById(`file-input-${uniqueId}`);
        const imagePreview = document.getElementById(`image-preview-${uniqueId}`);
        const pdfPreview = document.getElementById(`pdf-preview-${uniqueId}`);
        const fileViewerPlaceholder = document.getElementById(`file-viewer-${uniqueId}`);

        if (newModal && modalHeader && resizeHandle) {
            makeDraggableAndResizable(newModal, modalHeader,modalFooter,leftHandle,rightHandle, resizeHandle);
        }

        // Center the new modal on the screen
        const modalWidth = newModal.offsetWidth;
        const modalHeight = newModal.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        newModal.style.left = `${(windowWidth - modalWidth) / 2}px`;
        newModal.style.top = `${(windowHeight - modalHeight) / 2}px`;
        newModal.style.transform = 'none';
        newModal.style.position = 'fixed';
        newModal.style.display = 'flex';

        // --- File Handling Functionality ---
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                fileViewerPlaceholder.classList.add('hidden');
                const fileUrl = URL.createObjectURL(file);
                if (file.type.startsWith('image/')) {
                    imagePreview.src = fileUrl;
                    imagePreview.classList.remove('hidden');
                    pdfPreview.classList.add('hidden');
                } else if (file.type === 'application/pdf') {
                    pdfPreview.src = fileUrl;
                    pdfPreview.classList.remove('hidden');
                    imagePreview.classList.add('hidden');
                } else {
                    console.error('Unsupported file type. Please select an image or a PDF.');
                    fileViewerPlaceholder.textContent = 'Type de fichier non supporté.';
                    fileViewerPlaceholder.classList.remove('hidden');
                    imagePreview.classList.add('hidden');
                    pdfPreview.classList.add('hidden');
                }
            }
        });

        // --- Modal Visibility & Cleanup ---
        closeBtn.addEventListener('click', () => {
            if (newModal) {
                // Clear the file input and show the placeholder
                fileInput.value = '';
                imagePreview.classList.add('hidden');
                pdfPreview.classList.add('hidden');
                fileViewerPlaceholder.classList.remove('hidden');
                fileViewerPlaceholder.textContent = 'Aucun fichier sélectionné';

                // Remove the modal from the DOM
                newModal.remove();
            }
        });
    });
}

/**
 * Creates and returns a new modal element with unique IDs.
 * @param {string} uniqueId - A unique ID for the new modal.
 * @returns {HTMLElement} The created modal element.
 */
function createModalElement(uniqueId) {
    const modal = document.createElement('div');
    modal.id = uniqueId;
    modal.className = "flex-col bg-white border border-gray-300 w-[700px] h-[500px] shadow-2xl rounded-lg overflow-hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden z-[100] transform-gpu";
    modal.innerHTML = `
        <!-- Modal Header for Dragging -->
        <div id="modal-header-${uniqueId}" class="flex justify-between items-center bg-gray-50 p-4 border-b border-gray-200 cursor-move">
            <h4 class="text-sm font-semibold text-gray-700">Visionneuse de documents</h4>
            <div class="flex items-center space-x-2">
                <!-- File upload button -->
                <label for="file-input-${uniqueId}" class="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2z" />
                        <path fill-rule="evenodd" d="M5.25 15a.75.75 0 01.75.75v.5a1.5 1.5 0 001.5 1.5h5a1.5 1.5 0 001.5-1.5v-.5a.75.75 0 011.5 0v.5a3 3 0 01-3 3h-5a3 3 0 01-3-3v-.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
                    </svg>
                    Importer
                </label>
                <input type="file" id="file-input-${uniqueId}" accept="image/*, application/pdf" class="hidden">
                <!-- Close Button -->
                <button id="close-modal-btn-${uniqueId}" class="text-gray-500 hover:text-gray-900 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
        <!-- Modal Content for File Display -->
        <div id="modal-content" class="flex-grow p-4 overflow-auto relative flex items-center justify-center">
            <div id="file-viewer-${uniqueId}" class="w-full h-full text-center text-gray-400 flex items-center justify-center">
                Aucun fichier sélectionné
            </div>
            <img id="image-preview-${uniqueId}" class="hidden max-w-full max-h-full object-contain" alt="Aperçu du document">
            <iframe id="pdf-preview-${uniqueId}" class="hidden w-full h-full" title="Aperçu du PDF"></iframe>
        </div>
        <!-- Resize Handle -->
        <div id="resize-handle-${uniqueId}" class="absolute bottom-0 right-0 h-4 w-4 bg-gray-400 cursor-nwse-resize"></div>
    `;
    return modal;
}
