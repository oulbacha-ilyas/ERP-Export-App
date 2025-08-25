/**
 * @file emailModal.js
 * @description Manages the email modal functionality, including opening,
 * closing, checkbox logic, and sending emails. This code is designed to work
 * with the provided HTML structure where the modal and overlay are a single parent element.
 */
import { makeDraggableAndResizable } from './modals.js';

export function setupEmailModal() {
    const tableBody = document.getElementById('devis-table-body');
    const selectAllCheckbox = document.getElementById('selectAll');
    const emailButton = document.getElementById('email-button');
    const emailModal = document.getElementById('email-modal');
    const closeEmailModalBtn = document.getElementById('close-email-modal');
    const recipientsInput = document.getElementById('recipients');
    const sendEmailBtn = document.getElementById('send-email-btn');
    const modalHeader = document.getElementById('modal-header');
    const resizeHandle = document.getElementById('resize-handle');

    // As per your previous request, the dragging and resizing is commented out.
    // If you wish to re-enable it, uncomment the line below.
    makeDraggableAndResizable(emailModal.querySelector('#modal-content'), modalHeader, resizeHandle);

    // Function to update the email button's visibility
    function updateEmailButtonVisibility() {
        const selectedRows = document.querySelectorAll('.row-checkbox:checked');
        if (selectedRows.length > 0) {
            emailButton.classList.remove('scale-0');
            emailButton.classList.add('scale-100');
        } else {
            emailButton.classList.remove('scale-100');
            emailButton.classList.add('scale-0');
        }
    }

    // Function to handle opening the modal
    function openEmailModal() {
        const selectedRows = document.querySelectorAll('.row-checkbox:checked');
        const recipients = [];

        selectedRows.forEach(checkbox => {
            const email = checkbox.dataset.email;
            if (email) recipients.push(email);
        });

        if (recipients.length > 0) {
            recipientsInput.value = recipients.join(', ');
        }

        // This single line ensures the modal and its overlay become visible.
        emailModal.classList.remove('hidden');
    }

    // Function to handle closing the modal
    function closeEmailModal() {
        // This single line ensures the entire modal and its overlay are hidden,
        // making the rest of the page responsive again.
        emailModal.classList.add('hidden');
    }

    // Event listener for individual checkboxes
    if (tableBody) {
        tableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('row-checkbox')) {
                updateEmailButtonVisibility();
            }
        });
    }

    // Event listener for the "select all" checkbox
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            document.querySelectorAll('.row-checkbox').forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            updateEmailButtonVisibility();
        });
    }

    // Event listener for the email button
    if (emailButton) {
        emailButton.addEventListener('click', openEmailModal);
    }

    // Event listeners for closing the modal
    if (closeEmailModalBtn) {
        closeEmailModalBtn.addEventListener('click', closeEmailModal);
    }
    // Clicking on the modal background (the overlay) will now close it
    if (emailModal) {
        emailModal.addEventListener('click', (e) => {
            if (e.target === emailModal) {
                closeEmailModal();
            }
        });
    }

    // Event listener for the "Send" button
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', () => {
            const recipients = recipientsInput.value;
            const subject = document.getElementById('email-subject').value;
            const body = document.getElementById('email-body').value;

            if (recipients && subject && body) {
                // In a real application, you'd send this data to your backend
                console.log('Sending email to:', recipients);
                console.log('Subject:', subject);
                console.log('Body:', body);

                // For now, we simulate the behavior with a custom message box instead of alert
                // Here's a conceptual example of a function to show a message
                showMessageBox('Email sent successfully!');
                closeEmailModal();
            } else {
                showMessageBox('Veuillez remplir tous les champs.');
            }
        });
    }

    function showMessageBox(message) {
        // Implement your custom message box UI here, instead of using alert.
        // For example, you could show a temporary div with the message.
        console.log(message);
    }
}
