import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TerminalMap.css';

interface VisitedCountry {
  country: string;
  countryCode: string;
  coordinates: [number, number];
  nameVariations?: string[];
}

interface TerminalMapProps {
  visitedCountries?: VisitedCountry[];
  coordinates?: { lat: number; lng: number }[];
  theme: 'light' | 'dark';
  zoom?: number;
  height?: number;
  width?: number;
  forceWorldView?: boolean;
  noBorder?: boolean;
}

// Extract utility functions outside component to prevent unnecessary re-renders
const calculateMapCenter = (coordinates: { lat: number; lng: number }[], isWorldMapMode: boolean): [number, number] => {
  if (isWorldMapMode || coordinates.length === 0) {
    return [20, 0];
  }
  
  if (coordinates.length === 1 && coordinates[0]) {
    return [coordinates[0].lat, coordinates[0].lng];
  }
  
  const avgLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0) / coordinates.length;
  const avgLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0) / coordinates.length;
  return [avgLat, avgLng];
};

const calculateMapZoom = (coordinates: { lat: number; lng: number }[], isWorldMapMode: boolean, defaultZoom: number): number => {
  if (isWorldMapMode) {
    return 1.4;
  }
  
  if (coordinates.length === 0) {
    return 1;
  }
  
  if (coordinates.length === 1) {
    return defaultZoom || 10;
  }
  
  return (defaultZoom || 10) - 1;
};

const createMarkerIcon = (theme: 'light' | 'dark') => {
  return L.divIcon({
    html: `<div class="terminal-marker terminal-marker-${theme}"></div>`,
    className: 'terminal-marker-container',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const getCountryStyle = (isVisited: boolean, theme: 'light' | 'dark') => {
  if (isVisited) {
    return {
      fillColor: theme === 'dark' ? '#00ff41' : '#a06be0',
      weight: 2,
      opacity: 1,
      color: theme === 'dark' ? '#00ff41' : '#a06be0',
      fillOpacity: 0.6
    };
  }
  
  return {
    fillColor: '#333',
    weight: 1,
    opacity: 0.5,
    color: '#555',
    fillOpacity: 0.3
  };
};

const TerminalMap = ({
  visitedCountries = [],
  coordinates = [],
  theme,
  zoom = 1,
  height = 400,
  width = 600,
  forceWorldView = false,
  noBorder = false
}: TerminalMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Memoize visited country names for performance
  const visitedNames = useMemo(() => {
    if (visitedCountries.length === 0) return new Set<string>();
    
    return new Set(
      visitedCountries
        .flatMap(country => country.nameVariations || [country.country.toLowerCase()])
    );
  }, [visitedCountries]);

  // Memoize map configuration
  const mapConfig = useMemo(() => {
    const isWorldMapMode = forceWorldView || (visitedCountries.length > 0 && coordinates.length === 0);
    const isLocationMode = coordinates.length > 0;
    
    return {
      isWorldMapMode,
      isLocationMode,
      center: calculateMapCenter(coordinates, isWorldMapMode),
      zoom: calculateMapZoom(coordinates, isWorldMapMode, zoom)
    };
  }, [visitedCountries.length, coordinates, forceWorldView, zoom]);

  // Memoize marker icon to prevent recreation
  const markerIcon = useMemo(() => createMarkerIcon(theme), [theme]);

  const loadCountriesGeoJSON = useCallback(async (map: L.Map) => {
    try {
      // Try multiple GeoJSON sources for better country boundary accuracy
      const geoJsonSources = [
        // You can host your own GeoJSON file in the public folder for full control
        // '/world-boundaries.geojson', // Uncomment and add your own file
        
        // World Bank boundaries (often more politically accurate)
        'https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson',
        // Natural Earth data
        'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
        // Backup: original source
        'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/countries.geojson'
      ];

      let worldData = null;
      
      for (const source of geoJsonSources) {
        try {
          const response = await fetch(source);
          worldData = await response.json();
          break; // Use first successful source
        } catch (error) {
          continue; // Try next source
        }
      }

      if (!worldData) {
        throw new Error('All GeoJSON sources failed');
      }

      const geoJsonLayer = L.geoJSON(worldData, {
        style: (feature) => {
          const props = feature?.properties;
          const countryName = (props?.name || props?.NAME || props?.NAME_EN || '').toLowerCase();
          const isVisited = visitedNames.has(countryName);
          return getCountryStyle(isVisited, theme);
        },
        onEachFeature: (feature, layer) => {
          const countryName = (feature.properties?.name || feature.properties?.NAME || feature.properties?.NAME_EN || '').toLowerCase();
          const visitedCountry = visitedCountries.find(c => 
            (c.nameVariations || [c.country.toLowerCase()]).includes(countryName)
          );
          
          if (visitedCountry) {
            layer.bindTooltip(visitedCountry.country, {
              permanent: false,
              sticky: true,
              className: `terminal-tooltip terminal-tooltip-${theme}`
            });
          }
        }
      });

      geoJsonLayer.addTo(map);
    } catch (error) {
      // Fallback: add simple markers for visited countries
      visitedCountries.forEach((country) => {
        L.marker([country.coordinates[0], country.coordinates[1]], { icon: markerIcon }).addTo(map);
      });
    }
  }, [visitedCountries, visitedNames, theme, markerIcon]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current) return null;

    const map = L.map(mapRef.current, {
      center: mapConfig.center,
      zoom: mapConfig.zoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: false,
      touchZoom: false
    });

    // Set map background
    if (mapRef.current) {
      mapRef.current.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff';
    }

    return map;
  }, [mapConfig.center, mapConfig.zoom, theme]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const map = initializeMap();
      if (!map) return;

      if (mapConfig.isWorldMapMode && visitedCountries.length > 0) {
        // World map mode: load countries GeoJSON
        loadCountriesGeoJSON(map);
      } else if (mapConfig.isLocationMode) {
        // Location mode: add tile layer and markers
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          className: `terminal-tiles terminal-tiles-${theme}`
        });
        tileLayer.addTo(map);

        coordinates.forEach((coord) => {
          L.marker([coord.lat, coord.lng], { icon: markerIcon }).addTo(map);
        });
      } else {
        // Default: add tile layer for basic map
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          className: `terminal-tiles terminal-tiles-${theme}`
        });
        tileLayer.addTo(map);
      }

      mapInstanceRef.current = map;
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    mapConfig.isWorldMapMode, 
    mapConfig.isLocationMode, 
    visitedCountries, 
    coordinates, 
    theme, 
    initializeMap, 
    loadCountriesGeoJSON, 
    markerIcon
  ]);

  return (
    <div className={`terminal-map-container terminal-map-${theme} ${noBorder ? 'no-border' : ''}`}>
      <div
        ref={mapRef}
        className="terminal-map"
        style={{ height: `${height}px`, width: `${width}px` }}
      />
    </div>
  );
};

export default TerminalMap;