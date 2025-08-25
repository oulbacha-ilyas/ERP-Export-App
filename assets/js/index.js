// index.js

// Import the component loader.
import { loadComponentAndSetup } from './componentLoader.js';
// Import setup functions for other modals.
import { setupTopTabs, setupBottomTabs } from './tabs.js';
import { setupDocViewerModal } from './docViewerModal.js';
import { setupEmailModal } from './emailModal.js';
import { setupCameraModal } from './cameraModal.js';
import { setupShippingModal } from './shippingModal.js';

console.log("index.js file has been loaded.");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired. Initializing modules...");

    setupTopTabs();
    setupBottomTabs();

    const path = window.location.pathname;

    if (path.includes('devis-commandes-module.html')) {
        //setupEmailModal();
        console.log("Attempting to programmatically click the initial tab.");
    }

    const openCameraBtn = document.getElementById('open-camera-btn');
    if (openCameraBtn) {
        openCameraBtn.addEventListener('click', async () => {
            const cameraModal = await loadComponentAndSetup('camera-modal', './assets/html/cameraModal.html', setupCameraModal);
            cameraModal.open();
        });
    }

    const openDocViewerBtn = document.getElementById('open-viewer-btn');
    if (openDocViewerBtn) {
        openDocViewerBtn.addEventListener('click', async () => {
            const docViewerModal = await loadComponentAndSetup('docViewerModal', './assets/html/docViewerModal.html', setupDocViewerModal);
            docViewerModal.open();
        });
    }

    const openShippingBtn = document.getElementById('open-shipping-btn');
    //const shippingModal = document.getElementById('shippingModal');
    if (openShippingBtn) {
        openShippingBtn.addEventListener('click', async () => {
            const shippingModal = await loadComponentAndSetup('shippingModal', './assets/html/shippingModal.html', setupShippingModal);
            shippingModal.open();
        });
    } else {console.log("modal already loaded! No overload allowed for this modal")}


    console.log("Attempting to programmatically click the initial tab.");
    const saisieDevisTab = document.getElementById('saisie-devis-tab');
    if (saisieDevisTab) {
        saisieDevisTab.click();
        console.log("saisie-devis-tab was found and clicked.");
    } else {
        console.log("saisie-devis-tab was NOT found.");
    }
});
