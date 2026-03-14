import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import { Search, MapPin, Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";

const DEFAULT_POSITION = [28.6139, 77.209]; // Example: New Delhi
const RADIUS_METERS = 800;

function LocationSelector({ position, setPosition }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  // Center map when position changes programmatically
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

const LocationPicker = ({ position, setPosition }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching location data:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectLocation = (location) => {
    const newPos = [parseFloat(location.lat), parseFloat(location.lon)];
    setPosition(newPos);
    setSearchQuery(location.display_name);
    setShowDropdown(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPosition([latitude, longitude]);
        setSearchQuery("Current Location");
        setIsSearching(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please ensure location services are enabled.");
        setIsSearching(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: 16 }}>
      {/* Search Bar */}
      <div 
        ref={dropdownRef}
        style={{ 
          position: "absolute", 
          top: 10, 
          left: 10, 
          right: 50, // Leave space for zoom controls on the right
          zIndex: 1000,
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "8px 12px" }}>
          <Search size={18} color="#666" style={{ marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search for a place or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { setShowDropdown(true); }}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "14px",
              background: "transparent",
              color: "#333"
            }}
          />
          {isSearching && <span style={{ fontSize: "12px", color: "#666" }}>...</span>}
          <button
            type="button"
            onClick={handleLocateMe}
            title="Locate Me"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              marginLeft: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <Crosshair size={18} color="#ec4899" />
          </button>
        </div>

        {/* Dropdown Results */}
        {showDropdown && results.length > 0 && (
          <ul style={{ 
            listStyle: "none", 
            margin: 0, 
            padding: 0, 
            maxHeight: "200px", 
            overflowY: "auto",
            borderTop: "1px solid #eee"
          }}>
            {/* Current Location Option */}
            <li 
              onClick={handleLocateMe}
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                color: "#ec4899",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.2s",
                background: "rgba(236, 72, 153, 0.05)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(236, 72, 153, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(236, 72, 153, 0.05)"}
            >
              <Crosshair size={16} color="#ec4899" />
              <span>Use Current Location</span>
            </li>

            {results.map((result) => (
              <li 
                key={result.place_id}
                onClick={() => handleSelectLocation(result)}
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#333",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <MapPin size={16} color="#ec4899" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{result.display_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map Container */}
      <MapContainer
    center={position || DEFAULT_POSITION}
    zoom={15}
    style={{ height: "300px", width: "100%", marginBottom: 16 }}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
      <LocationSelector position={position} setPosition={setPosition} />
      {position && <Circle center={position} radius={RADIUS_METERS} pathOptions={{ color: "#ec4899" }} />}
    </MapContainer>
    </div>
  );
};

export default LocationPicker;
