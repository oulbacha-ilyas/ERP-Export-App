/**
 * @file tabs.js
 * @description Manages all tab switching logic for the application.
 * This module exports functions to set up both the main top tabs and the nested bottom tabs.
 */

/**
 * A helper function to manage tab states.
 * @param {NodeList} tabs - All the tab links in a set.
 * @param {NodeList} contents - All the content containers corresponding to the tabs.
 * @param {HTMLElement} activeTabLink - The tab link that was clicked.
 * @param {HTMLElement} activeContent - The content container to show.
 * @param {boolean} [hideListTitle=false] - Whether to hide the list title section.
 */
function activateTab(tabs, contents, activeTabLink, activeContent, hideListTitle = false) {
    console.log("Activating tab:", activeTabLink.href);

    // Deactivate all tabs
    tabs.forEach(t => {
        t.classList.remove('border-green-500', 'text-gray-900', 'font-medium');
        t.classList.add('border-transparent', 'text-gray-500');
    });

    // Activate the clicked tab
    activeTabLink.classList.add('border-green-500', 'text-gray-900', 'font-medium');
    activeTabLink.classList.remove('border-transparent', 'text-gray-500');

    // Hide all content sections
    contents.forEach(content => content.classList.add('hidden'));

    // Show the active content section
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }

    // Toggle the 'listes-title' based on the hideListTitle flag
    const listesTitle = document.getElementById('listes-title');
    if (listesTitle) {
        if (hideListTitle) {
            listesTitle.classList.add('hidden');
            console.log("Hiding listes-title.");
        } else {
            listesTitle.classList.remove('hidden');
            console.log("Showing listes-title.");
        }
    }
}

/**
 * Sets up the event listeners for the main top tabs.
 */
export function setupTopTabs() {
    console.log("Attempting to set up top tabs.");
    const topTabs = document.querySelectorAll('.top-tab-link');
    const mainContents = document.querySelectorAll('.tab-content');
    console.log(`Found ${topTabs.length} top tabs and ${mainContents.length} main content sections.`);

    if (topTabs.length === 0) {
        console.warn("No top tabs found. Check your HTML for elements with class 'top-tab-link'.");
        return;
    }

    topTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const mainContentId = this.getAttribute('href').substring(1) + '-content';
            const listContentId = this.getAttribute('href').substring(1) + '-lists-content';

            const activeMainContent = document.getElementById(mainContentId);
            const activeListContent = document.getElementById(listContentId);
            console.log("Top tab clicked. Activating content:", activeMainContent, "and list:", activeListContent);

            const hideListTitle = !activeListContent || activeListContent.children.length === 0;

            // Use the activateTab function for the main content
            activateTab(topTabs, mainContents, this, activeMainContent, hideListTitle);

            // Now, handle the list content separately to avoid conflicts
            const listContents = document.querySelectorAll('.list-content');
            listContents.forEach(content => content.classList.add('hidden'));
            if (activeListContent) {
                activeListContent.classList.remove('hidden');
            }

            // Trigger a click on the default bottom tab for the active section
            if (mainContentId === 'saisie-remboursements-content') {
                const remboursementsListTab = document.getElementById('remboursements-list-tab');
                if (remboursementsListTab) {
                    remboursementsListTab.click();
                }
            } else if (mainContentId === 'saisie-devis-content') {
                const devisListTab = document.getElementById('devis-list-tab');
                if (devisListTab) {
                    devisListTab.click();
                }
            }
        });
    });
}

/**
 * Sets up the event listeners for the bottom tabs (tables).
 */
export function setupBottomTabs() {
    console.log("Attempting to set up bottom tabs.");
    const bottomTabs = document.querySelectorAll('.bottom-tab-link');
    const bottomTables = document.querySelectorAll('.bottom-tab-table');
    console.log(`Found ${bottomTabs.length} bottom tabs and ${bottomTables.length} bottom tables.`);

    if (bottomTabs.length === 0 || bottomTables.length === 0) {
        console.warn("No bottom tabs or tables found. Check your HTML for elements with classes 'bottom-tab-link' and 'bottom-tab-table'.");
        return;
    }

    bottomTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Bottom tab clicked:", this.href);

            // Deactivate all bottom tabs
            bottomTabs.forEach(t => {
                t.classList.remove('border-green-500', 'text-gray-900', 'font-medium');
                t.classList.add('border-transparent', 'text-gray-500');
            });
            // Activate the clicked tab
            this.classList.add('border-green-500', 'text-gray-900', 'font-medium');
            this.classList.remove('border-transparent', 'text-gray-500');

            // Hide all bottom tables
            bottomTables.forEach(table => {
                table.classList.add('hidden');
            });

            // Show the table that corresponds to the clicked tab
            const targetId = this.getAttribute('href').substring(1) + '-table';
            const targetTable = document.getElementById(targetId);
            if (targetTable) {
                targetTable.classList.remove('hidden');
                console.log("Showing bottom table with ID:", targetId);
            } else {
                console.error("Could not find bottom table with ID:", targetId);
            }
        });
    });

    // Automatically click the first tab to show its content on page load
    if (bottomTabs.length > 0) {
        console.log("Programmatically clicking the first bottom tab.");
        bottomTabs[0].click();
    }
}
