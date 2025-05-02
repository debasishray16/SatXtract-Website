"use client";
import React, { useState, useRef } from "react";
import { Map } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";

const MAP_STYLE = {
  version: 8,
  sources: {
    esriSatellite: {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "&copy; Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [
    {
      id: "esriSatellite",
      type: "raster",
      source: "esriSatellite",
    },
  ],
};

const MapDisplay = (scrollTargetRef) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState({ lat: 23.259933, lon: 77.412613 });
  const [mapCorners, setMapCorners] = useState(null);
  const [zoom, setZoom] = useState(3);

  const handleZoomChange = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      setZoom(Math.round(currentZoom)); // Update zoom state
    }
  };

  const handleCenterChange = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      setCoords({ lat: center.lat.toFixed(6), lon: center.lng.toFixed(6) }); // Update center coordinates
    }
  };

  const searchLocation = async () => {
    if (!location) return;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );
    const data = await response.json();

    if (data.length > 0) {
      const { lat, lon } = data[0];
      setCoords({ lat: parseFloat(lat), lon: parseFloat(lon) });

      mapRef.current?.flyTo({
        center: [parseFloat(lon), parseFloat(lat)],
        zoom: 11,
        essential: true,
      });
      setZoom(11);
    } else {
      alert("Location not found!");
    }
  };

  const handleDownloadScreenshot = async () => {
    const res = await fetch("/api/screenshot");
    const data = await res.json();

    if (data.url) {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "map-screenshot.png";
      link.click();
    }
  };

  const getStaticMap = () => {
    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();
    const zoom = Math.round(mapRef.current.getZoom());
    setZoom(zoom);
    const lat = center.lat.toFixed(6);
    const lon = center.lng.toFixed(6);

    const mapUrl = `https://static-maps.yandex.ru/1.x/?ll=${lon},${lat}&z=${zoom}&l=sat&size=650,450`;

    window.open(mapUrl, "_blank");
  };

  const getVisibleCorners = () => {
    if (!mapRef.current) return;

    const bounds = mapRef.current.getBounds();

    const ne = bounds.getNorthEast(); // Top-right corner
    const sw = bounds.getSouthWest(); // Bottom-left corner

    const nw = { lat: ne.lat, lon: sw.lng }; // Top-left corner
    const se = { lat: sw.lat, lon: ne.lng }; // Bottom-right corner

    console.log("Top-Left (NW):", nw);
    console.log("Top-Right (NE):", ne);
    console.log("Bottom-Left (SW):", sw);
    console.log("Bottom-Right (SE):", se);

    const newMapCorners = [
      [nw.lon, nw.lat], // Top-left corner
      [sw.lng, sw.lat], // Bottom-left corner
      [se.lon, se.lat], // Bottom-right corner
      [ne.lng, ne.lat], // Top-right corner
    ];

    console.log("Map Corners:", newMapCorners);
    setMapCorners(newMapCorners);
  };

  const sendLocationData = async () => {
    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();
    const zoom = Math.round(mapRef.current.getZoom());
    const lat = center.lat.toFixed(6);
    const lon = center.lng.toFixed(6);
    console.log("Sending Map Corners:", mapCorners);

    setTimeout(async () => {
      try {
        await axios.post("/api/sendMapData", { lat, lon, zoom, mapCorners });
        console.log("Data sent successfully");
        console.log("Map Corners:", mapCorners);
        console.log("Center Coordinates:", { lat, lon });
        console.log("Zoom Level:", zoom);
        console.log("Zoom Level:", typeof zoom);
        
        
      } catch (error) {
        console.error(error);
        console.log("Error sending data");
      }
    }, 5000);
  };

  const handleViewMapClick = () => {
    getVisibleCorners();
    sendLocationData();

    // Scroll to the target section
    if (scrollTargetRef.current) {
      scrollTargetRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      {/* Search Box */}
      <div className="flex mb-4">
        <input
          type="text"
          className="border p-2 rounded w-full"
          placeholder="Enter location name..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchLocation()}
        />
        <button
          className="ml-2 outline-1 shadow-2xs p-2 rounded"
          onClick={searchLocation}
        >
          Search
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="flex flex-col md:flex-row items-start relative gap-20 rounded-md"
      >
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: coords.lon,
            latitude: coords.lat,
            zoom: zoom,
          }}
          minZoom={1}
          maxZoom={15}
          style={{ width: "100%", height: 500 }}
          mapStyle={MAP_STYLE}
          dragPan={true}
          onZoomEnd={handleZoomChange}
          onMoveEnd={handleCenterChange}
        />
        <div className="flex flex-col items-start justify-start gap-10 mt-20 mr-4">
          <div className="flex flex-row gap-6 textarea border-base-300 w-[280px] text-md">
            <p>
              {coords
                ? `Longitude: ${coords.lon} Latitude: ${coords.lat}`
                : "Coordinates..."}
            </p>
            <p>Zoom Level: {zoom}</p>
          </div>
          {/* Static Map Button */}
          <button
            className="rounded border-2 border-base-300 outline hover:shadow-lg p-3 px-23 tooltip tooltip-info tooltip-bottom" data-tip="Zoom between 8 and 12 is recommended"
            onClick={handleViewMapClick}
          >
            View Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;
