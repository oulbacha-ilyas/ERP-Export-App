/**
 * @file modals.js
 * @description Provides a reusable function to make a modal draggable and resizable.
 */

/**
 * Makes a given modal element draggable by its header and resizable by a handle.
 * @param {HTMLElement} modal - The main modal element.
 * @param {HTMLElement} header - The header element to initiate dragging.
 * @param {HTMLElement} footer - The footer element to initiate dragging.
 * @param {HTMLElement} leftHandle - The footer element to initiate dragging.
 * @param {HTMLElement} rightHandle - The footer element to initiate dragging.
 * @param {HTMLElement} resizeHandle - The element to initiate resizing.
 */
export function makeDraggableAndResizable(modal, header,footer,leftHandle,rightHandle, resizeHandle) {
    let isDragging = false;
    let isResizing = false;
    let initialX, initialY;
    let initialWidth, initialHeight;

    // --- Dragging Functionality ---
    header.addEventListener('mousedown', dragStart);
    leftHandle.addEventListener('mousedown', dragStart);
    rightHandle.addEventListener('mousedown', dragStart);
    if (footer) {
     footer.addEventListener('mousedown', dragStart);
   } else {console.log("footer not found")}
    function dragStart(e) {
        isDragging = true;
        modal.classList.add('dragging');
        modal.style.transition = 'none'; // Disable transition during drag

        // Get the current position relative to the viewport
        const modalRect = modal.getBoundingClientRect();
        // Calculate the initial offset from the mouse to the modal's top-left corner
        initialX = e.clientX - modalRect.left;
        initialY = e.clientY - modalRect.top;

        // Remove any conflicting transforms
        modal.style.transform = 'none';

        // Set the modal's position to its current location using left/top
        modal.style.left = `${modalRect.left}px`;
        modal.style.top = `${modalRect.top}px`;
        modal.style.position = 'fixed';

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            const newLeft = e.clientX - initialX;
            const newTop = e.clientY - initialY;

            modal.style.left = `${newLeft}px`;
            modal.style.top = `${newTop}px`;
        }
    }

    function dragEnd() {
        isDragging = false;
        modal.classList.remove('dragging');
        // Re-enable transition after drag
        modal.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
    }

    // --- Resizing Functionality ---
    resizeHandle.addEventListener('mousedown', resizeStart);

    function resizeStart(e) {
        e.stopPropagation(); // Prevents dragging from starting at the same time
        isResizing = true;
        modal.classList.add('resizing');
        initialX = e.clientX;
        initialY = e.clientY;
        initialWidth = modal.offsetWidth;
        initialHeight = modal.offsetHeight;
        modal.style.transition = 'none'; // Disable transition during resize

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', resizeEnd);
    }

    function resize(e) {
        if (isResizing) {
            const newWidth = initialWidth + (e.clientX - initialX);
            const newHeight = initialHeight + (e.clientY - initialY);
            // Set minimum dimensions
            modal.style.width = Math.max(newWidth, 400) + 'px';
            modal.style.height = Math.max(newHeight, 300) + 'px';
        }
    }

    function resizeEnd() {
        isResizing = false;
        modal.classList.remove('resizing');
        modal.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', resizeEnd);
    }
}
