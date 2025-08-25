/**
 * @file componentLoader.js
 * @description A reusable utility to fetch an HTML component,
 * inject it into the DOM, and then run an associated setup function.
 */
 import { createModalElement} from './docViewerModal.js';

const loadedComponents = {};
let windowCount =0;
let tempDiv;
/**
 * Dynamically loads an HTML component and executes a setup function.
 * @param {string} componentId - The ID of the main component element.
 * @param {string} filePath - The path to the HTML file.
 * @param {Function} setupFunction - The JS function to call after the component is loaded.
 * @returns {Promise<Object>} An object containing the component's API (e.g., { open, close }).
 */
export async function loadComponentAndSetup(componentId, filePath, setupFunction) {
    if (loadedComponents[componentId]) {
          console.log(`Component '${componentId}' already loaded. Reusing existing instance.`);
        //if (componentId=="docViewerModal"){
          const response = await fetch(filePath);
          tempDiv = document.createElement('div');
          if (!response.ok) {
              throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
          }
          const html = await response.text();
          tempDiv.innerHTML = html;
          const elementsWithIds = tempDiv.querySelectorAll('[id]');
          elementsWithIds.forEach(element => {
              console.log(`${element.id} changed to ${element.id}-${windowCount}`)
              element.id = `${element.id}-${windowCount}`;
          });
          // Then update labels to match the new IDs
          const labels = tempDiv.querySelectorAll('label[for]');
          labels.forEach(label => {
              const forValue = label.getAttribute('for');
              label.setAttribute('for', `${forValue}-${windowCount}`);
          });
          console.log(`updated div was  '${tempDiv.id}'`);

          const component = appendComponent(componentId,windowCount);
          return component
          /*console.log(`A new Component '${componentId}' will be created.`);
          windowCount++;
          const uniqueId = `docViewerModal-${windowCount}`;
          console.log(`windowCount value '${windowCount}' created`);
          tempDiv = createModalElement(uniqueId);
          console.log(`tempDiv '${uniqueId}' created`);
          if (tempDiv) {
            console.log(`tempDiv actual id'${tempDiv.id}' created`);
            console.log(`calling for appending '${uniqueId}' component`);
            const component = appendComponent(uniqueId);
            return component

          }
          else {console.log(`tempDiv '${uniqueId}' not properly created`);}*/
        //}
          return loadedComponents[componentId];
    }
    else {
          try {
        const response = await fetch(filePath);
        tempDiv = document.createElement('div');
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
        }
        const html = await response.text();
        tempDiv.innerHTML = html;
        const elementsWithIds = tempDiv.querySelectorAll('[id]');
        elementsWithIds.forEach(element => {
            console.log(`${element.id} changed to ${element.id}-${windowCount}`)
            element.id = `${element.id}-${windowCount}`;
        });
        // Then update labels to match the new IDs
        const labels = tempDiv.querySelectorAll('label[for]');
        labels.forEach(label => {
            const forValue = label.getAttribute('for');
            label.setAttribute('for', `${forValue}-${windowCount}`);
        });
        console.log(`updated div was  '${tempDiv.id}'`);
        const testquery = tempDiv.querySelector(`#${componentId}`);
        if (testquery) {
          console.log(`updated div has  '#${componentId}'`);
        }

        const component = appendComponent(componentId,windowCount);

        return component

        } catch (error) {
        console.log('Error loading component:', error);
        throw error;
    }
    }
    // Append component function
    function appendComponent(appendId,appendCounter) {
            console.log(`asking querySelector for '#${appendId}-${appendCounter}' done`);
            if (tempDiv) {
              const componentElement = tempDiv.querySelector(`#${appendId}-${appendCounter}`);
              if (componentElement) {
                console.log(`componentElement found with id '${componentElement.id}'`);
                console.log(`asking appendChild for '${componentElement.id}' done`);
                document.body.appendChild(componentElement);
                console.log(`appending child for '#${appendId}-${appendCounter}' done`);
                console.log(`calling setupFunction for '#${appendId}-${appendCounter}' ...`);
                const componentApi = setupFunction(appendId,appendCounter);
                loadedComponents[componentId] = componentApi;
                console.log(`Component '${componentId}' has been loaded and initialized.`);
                windowCount++;
                return componentApi;
               } else {console.log(`componentElement is not found`);
                 console.error(`Component element with ID '#${appendId}-${appendCounter}' not found in the file.`);
                 throw new Error(`Component element with ID '#${appendId}-${appendCounter}' not found.`);
               }
            } else {console.log(`tempDiv is not properly loaded`);}


            if (componentElement) {
                 //
                 console.log(`something else 1`);
            } else {
               //
               console.log(`something else 2`);
            }
    }

}
/**
 * Checks if a component is currently loaded.
 * @param {string} componentId The ID of the component to check.
 * @returns {boolean} True if the component is loaded, false otherwise.
 */
export const isComponentLoaded = (componentId) => {
    return !!loadedComponents[componentId];
};

/**
 * Gets a reference to a loaded component instance.
 * @param {string} componentId The ID of the component to get.
 * @returns {object|undefined} The component instance or undefined if not found.
 */
export const getLoadedComponent = (componentId) => {
    return loadedComponents[componentId];
};
/**
 * Unloads a component by removing it from the DOM and the cache.
 * @param {string} componentId - The ID of the component to unload.
 */
export function unloadComponent(componentId) {
    const componentElement = document.getElementById(componentId);
    if (componentElement) {
        componentElement.remove();
        console.log(`Component '${componentId}' has been unloaded.`);
    }

    if (loadedComponents[componentId]) {
        delete loadedComponents[componentId];
        console.log(`Component '${componentId}' has been cleared from cache.`);
    }
}
