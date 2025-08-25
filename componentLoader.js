/**
 * @file componentLoader.js
 * @description A reusable utility to fetch an HTML component,
 * inject it into the DOM, and then run an associated setup function.
 */

/**
 * Dynamically loads an HTML component and executes a setup function.
 * This is useful for structuring your project with reusable components.
 * @param {string} componentId - The ID of the main component element to inject.
 * @param {string} filePath - The path to the HTML file containing the component.
 * @param {Function} setupFunction - The JavaScript function to call after
 * the component is loaded and added to the DOM.
 */
export async function loadComponentAndSetup(componentId, filePath, setupFunction) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
        }
        const html = await response.text();

        // Create a temporary container to hold the fetched HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Find the specific component element within the fetched HTML
        const componentElement = tempDiv.querySelector(`#${componentId}`);
        if (componentElement) {
            // Append the component to the body of the current page
            document.body.appendChild(componentElement);

            // Now that the component is in the DOM, safely call its setup function
            setupFunction();

            console.log(`Component '${componentId}' has been loaded and initialized.`);
        } else {
            console.error(`Component element with ID '${componentId}' not found in the file.`);
        }

    } catch (error) {
        console.error('Error loading component:', error);
    }
}
