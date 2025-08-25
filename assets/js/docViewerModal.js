/**
 * @file docViewerModal.js
 * @description Manages the file viewer modal, including opening, closing,
 * file selection, and previewing images and PDFs. This version supports
 * multiple, independently draggable and resizable windows.
 */

import { makeDraggableAndResizable } from './modals.js';
// Import the specific functions you need from componentLoader.js
import { unloadComponent,isComponentLoaded, getLoadedComponent} from './componentLoader.js';

export function setupDocViewerModal(componentId,componentCounter) {

    // Get the elements with their unique IDs
    const modal = document.getElementById(`${componentId}-${componentCounter}`);
    const closeBtn = modal.querySelector(`#close-modal-btn-${componentCounter}`);
    const modalHeader = modal.querySelector(`#modal-header-${componentCounter}`);
    const modalFooter = modal.querySelector(`#docViewerModal-footer-${componentCounter}`);
    const leftHandle = modal.querySelector(`#docViewerModal-left-handle-${componentCounter}`);
    const rightHandle = modal.querySelector(`#docViewerModal-right-handle-${componentCounter}`);
    const resizeHandle = modal.querySelector(`#resize-handle-${componentCounter}`);
    const fileInput = modal.querySelector(`#file-input-${componentCounter}`);
    const imagePreview = modal.querySelector(`#image-preview-${componentCounter}`);
    const pdfPreview = modal.querySelector(`#pdf-preview-${componentCounter}`);
    const fileViewerPlaceholder = modal.querySelector(`#file-viewer-${componentCounter}`);

    makeDraggableAndResizable(modal, modalHeader,modalFooter,leftHandle,rightHandle, resizeHandle);

    // Center the new modal on the screen
    const modalWidth = modal.offsetWidth;
    const modalHeight = modal.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    modal.style.left = `${(windowWidth - modalWidth) / 2}px`;
    modal.style.top = `${(windowHeight - modalHeight) / 2}px`;
    modal.style.transform = 'none';
    modal.style.position = 'fixed';
    modal.style.display = 'flex';

    // --- File Handling Functionality ---
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("a file found")
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
        } else {console.log("no file found")}
    });

    // --- Modal Visibility & Cleanup ---

    // Close modal function
    const closeDocViewerModal = () => {
        modal.style.display = 'none';
        // Unload the component by its ID
        unloadComponent(modal.id);
        modal.remove();
     };

    // Open modal function
    const openDocViewerModal = () => {
        modal.style.display = 'flex';
        // The fix: Initialize the map only after the modal becomes visible
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeDocViewerModal);
    }
    // Expose functions for use by other modules
    return {
        open: openDocViewerModal,
        close: closeDocViewerModal
    };
}

/**
 * Creates and returns a new modal element with unique IDs.
 * @param {string} uniqueId - A unique ID for the new modal.
 * @returns {HTMLElement} The created modal element.
 */
export function createModalElement(componentId) {
    const modal = document.createElement('div');
    modal.id = `docViewerModal-${componentId}`;
    modal.className = "flex-col bg-white border border-gray-300 w-[700px] h-[500px] shadow-2xl rounded-lg overflow-hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden z-[100] transform-gpu";
    modal.innerHTML = `
    <div id="docViewerModal-${componentId}" class="flex flex-col bg-white border border-gray-300 w-[700px] h-[500px] rounded-lg shadow-xl ">
        <!-- Draggable left handle -->
        <div id="docViewerModal-left-handle" class="absolute left-0 top-0 w-2 h-full cursor-move"></div>
        <!-- Draggable right handle -->
        <div id="docViewerModal-right-handle" class="absolute right-0 top-0 w-2 h-full cursor-move"></div>

        <!-- Modal Header for Dragging -->
        <div id="modal-header" class="flex justify-between items-center bg-gray-50 p-4 border-b border-gray-200 cursor-move no-select">
            <h4 class="text-sm font-semibold text-gray-700">Visionneuse de documents</h4>
            <div class="flex items-center space-x-2">
                <!-- File upload button -->
                <label for="file-input" class="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2z" />
                        <path fill-rule="evenodd" d="M5.25 15a.75.75 0 01.75.75v.5a1.5 1.5 0 001.5 1.5h5a1.5 1.5 0 001.5-1.5v-.5a.75.75 0 011.5 0v.5a3 3 0 01-3 3h-5a3 3 0 01-3-3v-.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
                    </svg>
                    Importer
                </label>
                <input type="file" id="file-input" accept="image/*, application/pdf" class="hidden">
                <!-- Close Button -->
                <button id="close-modal-btn" class="text-gray-500 hover:text-gray-900 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Modal Content for File Display -->
        <div id="modal-content" class="flex-grow p-4 overflow-auto relative flex items-center justify-center">
            <div id="file-viewer" class="w-full h-full text-center text-gray-400 flex items-center justify-center">
                Aucun fichier sélectionné
            </div>
            <img id="image-preview" class="hidden max-w-full max-h-full object-contain" alt="Aperçu du document">
            <iframe id="pdf-preview" class="hidden w-full h-full" title="Aperçu du PDF"></iframe>
        </div>
        <div id="docViewerModal-footer" class="flex justify-between items-center px-6 py-4 border-t border-gray-200"></div>

        <!-- Resize Handle -->
        <div id="resize-handle" class="absolute bottom-0 right-0 h-4 w-4 bg-gray-400 cursor-nwse-resize"></div>
    </div>
    `;
    return modal;
}
