let map;
let userMarker;
let restaurantMarkers = [];

// Button click event
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("useLocationBtn");
    if (btn) {
        btn.addEventListener("click", getUserLocation);
    }
});

function getUserLocation() {
    if (navigator.geolocation) {
        showNotification("Fetching your location...", "info");
        navigator.geolocation.getCurrentPosition(showMap, handleLocationError);
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

function showMap(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    // Initialize map if not already created
    if (!map) {
        map = L.map("map").setView([lat, lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lng], 15);
    }

    // Add or move user marker
    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
    } else {
        userMarker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup("📍 You are here!")
            .openPopup();
    }

    // Fetch nearby restaurants
    fetchNearbyRestaurants(lat, lng);
}

function fetchNearbyRestaurants(lat, lng) {
    // Clear previous restaurant markers
    restaurantMarkers.forEach(marker => map.removeLayer(marker));
    restaurantMarkers = [];

    const radius = 2000; // 2km radius (increased for better results)
    const overpassUrl = "https://overpass-api.de/api/interpreter";
    const query = `
        [out:json];
        (
            node["amenity"="restaurant"](around:${radius},${lat},${lng});
            node["amenity"="fast_food"](around:${radius},${lat},${lng});
            way["amenity"="restaurant"](around:${radius},${lat},${lng});
            way["amenity"="fast_food"](around:${radius},${lat},${lng});
        );
        out center;
    `;

    showNotification("🍴 Loading restaurants near you...", "info");

    fetch(overpassUrl, {
        method: "POST",
        body: query
    })
        .then(response => response.json())
        .then(data => {
            if (!data.elements || data.elements.length === 0) {
                showNotification("No restaurants found nearby.", "error");
                return;
            }

            showNotification(`✅ Found ${data.elements.length} restaurants near you!`, "success");

            data.elements.forEach(place => {
                const placeLat = place.lat || place.center.lat;
                const placeLng = place.lon || place.center.lon;
                const name = place.tags.name || "Unnamed Restaurant";
                const type = place.tags.amenity || "restaurant";

                const marker = L.marker([placeLat, placeLng])
                    .addTo(map)
                    .bindPopup(`<strong>${name}</strong><br>🍽️ ${type}`);
                restaurantMarkers.push(marker);
            });
        })
        .catch(error => {
            console.error("Error fetching nearby restaurants:", error);
            showNotification("⚠️ Failed to load restaurants. Try again.", "error");
        });
}

function handleLocationError(error) {
    alert("Error getting location: " + error.message);
}

/* Simple notification function */
function showNotification(message, type = "info") {
    // You can style this better with CSS
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
}
