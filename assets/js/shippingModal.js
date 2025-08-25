// shipping-modal.js
import { makeDraggableAndResizable } from './modals.js';
import { unloadComponent } from './componentLoader.js';

// Fictional Dynamic Data Table with accurate coordinates
const shippingData = [
    {
        id: 'SHIP-001',
        origin: { name: 'San Francisco, CA', coords: [37.7749, -122.4194] },
        destination: { name: 'New York, NY', coords: [40.7128, -74.0060] },
        currentLocation: { name: 'Kansas City, MO', coords: [39.0997, -94.5786] },
        status: 'In Transit',
        timeRemaining: '12h',
        route: [
            [37.7749, -122.4194], [39.2921, -120.0824], [40.7608, -111.8910],
            [40.8136, -104.9877], [39.7392, -104.9903], [39.0997, -94.5786],
            [39.7617, -86.1581], [40.7128, -74.0060]
        ]
    },
    {
        id: 'SHIP-002',
        origin: { name: 'Los Angeles, CA', coords: [34.0522, -118.2437] },
        destination: { name: 'Dallas, TX', coords: [32.7767, -96.7970] },
        currentLocation: { name: 'Phoenix, AZ', coords: [33.4484, -112.0740] },
        status: 'Delayed',
        timeRemaining: '3h',
        route: [
            [34.0522, -118.2437], [33.4484, -112.0740], [32.7767, -96.7970]
        ]
    },
    {
        id: 'SHIP-003',
        origin: { name: 'Miami, FL', coords: [25.7617, -80.1918] },
        destination: { name: 'Seattle, WA', coords: [47.6062, -122.3321] },
        currentLocation: { name: 'Denver, CO', coords: [39.7392, -104.9903] },
        status: 'On Schedule',
        timeRemaining: '2d 6h',
        route: [
            [25.7617, -80.1918], [29.7604, -95.3698], [32.7767, -96.7970],
            [39.7392, -104.9903], [41.8781, -87.6298], [47.6062, -122.3321]
        ]
    }
];

/**
 * Initializes and sets up the shipping modal with all its functionalities.
 */
export function setupShippingModal(componentId,componentCounter) {
    const modal = document.getElementById(`${componentId}-${componentCounter}`);
    const mapContainer = modal.querySelector(`#shipping-map-container-${componentCounter}`);
    const header = modal.querySelector(`#shipping-modal-header-${componentCounter}`);
    const leftHandle = modal.querySelector(`#shipping-modal-left-handle-${componentCounter}`);
    const rightHandle = modal.querySelector(`#shipping-modal-right-handle-${componentCounter}`);
    const closeBtn = modal.querySelector(`#close-modal-btn-${componentCounter}`);
    const footer = modal.querySelector(`#shipping-modal-footer-${componentCounter}`);
    const tableBody = modal.querySelector(`#shipping-data-body-${componentCounter}`);
    const resizeHandle = modal.querySelector(`#shipping-modal-resize-handle-${componentCounter}`);
    const backdrop = modal.querySelector(`#shipping-modal-backdrop-${componentCounter}`);

    let mapInstance = null;
    let currentMarkers = [];
    let currentRoute = null;

    // Use the external function to make the modal draggable and resizable.
    // The onResizeCallback ensures the map redraws when the modal size changes.
    makeDraggableAndResizable(modal, header, footer,leftHandle,rightHandle, resizeHandle, () => {
        if (mapInstance) {
            mapInstance.invalidateSize();
        }
    });

    /**
     * Populates the shipping data table with dynamic data.
     */
    const populateShippingTable = () => {
        if (tableBody) {
            tableBody.innerHTML = '';
            shippingData.forEach(item => {
                const row = document.createElement('tr');
                row.className = 'bg-white border-b hover:bg-gray-50 cursor-pointer';
                row.dataset.shipmentId = item.id;
                row.innerHTML = `
                    <td class="px-6 py-4 font-semibold">${item.id}</td>
                    <td class="px-6 py-4">${item.origin.name}</td>
                    <td class="px-6 py-4">${item.destination.name}</td>
                    <td class="px-6 py-4">${item.status}</td>
                    <td class="px-6 py-4">${item.timeRemaining}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    };
    /**
     * Initializes the Leaflet map.
     */
    const initMap = () => {
        // Only create the map instance once
        if (mapInstance) {
            mapInstance.invalidateSize(); // Invalidate if it already exists
            return;
        }
        try {
            mapInstance = L.map(mapContainer, {
                center: [39.0997, -94.5786],
                zoom: 4,
                scrollWheelZoom: true
            });

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance);

            // Invalidate size immediately after initialization
            mapInstance.invalidateSize();

            if (shippingData.length > 0) {
                updateMap(shippingData[0]);
            }
        } catch (e) {
            console.error('Failed to initialize map:', e);
        }
    };
    /**
     * Clears all markers and polylines from the map.
     */
    const clearMap = () => {
        currentMarkers.forEach(marker => mapInstance.removeLayer(marker));
        currentMarkers = [];
        if (currentRoute) {
            mapInstance.removeLayer(currentRoute);
            currentRoute = null;
        }
    };

    /**
     * Updates the map with a specific shipment's data.
     * @param {object} shipment - The shipment data object.
     */
    const updateMap = (shipment) => {
        // Ensure mapInstance exists before using it
        initMap();
        if (!mapInstance) {
            console.error("Map not initialized. Cannot update.");
            return;
        }
        clearMap();

        const currentLocationMarker = L.circleMarker(shipment.currentLocation.coords, {
            color: 'blue',
            fillColor: '#30a3ec',
            fillOpacity: 0.8,
            radius: 8
        }).addTo(mapInstance).bindPopup(`<b>Current Location:</b> ${shipment.currentLocation.name}`);
        currentMarkers.push(currentLocationMarker);

        const originMarker = L.marker(shipment.origin.coords, {
            title: 'Origin'
        }).addTo(mapInstance).bindPopup(`<b>Origin:</b> ${shipment.origin.name}`);
        const destinationMarker = L.marker(shipment.destination.coords, {
            title: 'Destination'
        }).addTo(mapInstance).bindPopup(`<b>Destination:</b> ${shipment.destination.name}`);
        currentMarkers.push(originMarker, destinationMarker);

        currentRoute = L.polyline(shipment.route, { color: 'red', weight: 3, dashArray: '10, 5' }).addTo(mapInstance);

        const group = new L.featureGroup([...currentMarkers, currentRoute]);
        mapInstance.fitBounds(group.getBounds());
    };



    // Close modal function
    const closeShippingModal = () => {

        modal.style.display = 'none';
        // Unload the component by its ID
        unloadComponent(modal.id);
        //modal.remove();

    };

    // Open modal function
    const openShippingModal = () => {
        modal.style.display = 'flex';
        // The fix: Initialize the map only after the modal becomes visible
        initMap();
    };

    // Set up event listeners
    tableBody.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (row && row.dataset.shipmentId) {
            const shipmentId = row.dataset.shipmentId;
            const selectedShipment = shippingData.find(item => item.id === shipmentId);
            if (selectedShipment) {
                updateMap(selectedShipment);
            }
        }
    });

    // Add a click listener to the close button inside the modal
    //
    if (closeBtn) {
        closeBtn.addEventListener('click', closeShippingModal);
    }

    // Initial setup
    populateShippingTable();

    // Expose functions for use by other modules
    return {
        open: openShippingModal,
        close: closeShippingModal
    };
}
