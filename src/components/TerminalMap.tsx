import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
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
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
    return isMobile ? 0 : 1.4;
  }
  
  if (coordinates.length === 0) {
    return 1;
  }
  
  if (coordinates.length === 1) {
    return defaultZoom || 10;
  }
  
  // For multiple coordinates, calculate bounds and determine zoom to fit all markers
  const lats = coordinates.map(coord => coord.lat);
  const lngs = coordinates.map(coord => coord.lng);
  
  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);
  const lngMin = Math.min(...lngs);
  const lngMax = Math.max(...lngs);
  
  const latSpan = latMax - latMin;
  const lngSpan = lngMax - lngMin;
  
  // Calculate zoom based on the span - larger spans need lower zoom levels
  const maxSpan = Math.max(latSpan, lngSpan);
  
  if (maxSpan > 10) return 3;  // Very large area (cross-continent)
  if (maxSpan > 5) return 4;   // Large area (multiple provinces/states)
  if (maxSpan > 2) return 5;   // Medium-large area
  if (maxSpan > 1) return 6;   // Medium area
  if (maxSpan > 0.5) return 7; // Smaller area
  if (maxSpan > 0.2) return 8; // Small area
  if (maxSpan > 0.1) return 9; // Very small area
  
  return Math.max(6, (defaultZoom || 10) - 2); // Default fallback with minimum zoom of 6
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
  const fitBoundsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const invalidateSizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Memoize visited country names for performance
  const visitedNames = useMemo(() => {
    if (visitedCountries.length === 0) return new Set<string>();
    
    return new Set(
      visitedCountries
        .flatMap(country => country.nameVariations || [country.country.toLowerCase()])
    );
  }, [visitedCountries]);

  // Memoize map configuration
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  const mapConfig = useMemo(() => {
    const isWorldMapMode = forceWorldView || (visitedCountries.length > 0 && coordinates.length === 0);
    const isLocationMode = coordinates.length > 0;
    let effectiveZoom = zoom;
    if (isWorldMapMode && isMobile) {
      effectiveZoom = 0;
    }
    return {
      isWorldMapMode,
      isLocationMode,
      center: calculateMapCenter(coordinates, isWorldMapMode),
      zoom: calculateMapZoom(coordinates, isWorldMapMode, effectiveZoom)
    };
  }, [visitedCountries.length, coordinates, forceWorldView, zoom, isMobile]);

  // Memoize marker icon to prevent recreation
  const markerIcon = useMemo(() => createMarkerIcon(theme), [theme]);

  const loadCountriesGeoJSON = useCallback(async (map: L.Map) => {
    try {
      // Try multiple GeoJSON sources for better country boundary accuracy
      const geoJsonSources = [
        // Custom India boundaries with complete Jammu & Kashmir (priority source)
        '/akhand-bharat.geojson',
        // World Bank boundaries (often more politically accurate)
        'https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson',
        // Natural Earth data
        'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
        // Backup: original source
        'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/countries.geojson'
      ];

      let worldData = null;
      let indiaData = null;
      
      // First, try to load the custom India GeoJSON
      try {
        const indiaResponse = await fetch('/akhand-bharat.geojson');
        if (indiaResponse.ok) {
          indiaData = await indiaResponse.json();
        }
      } catch (error) {
        console.warn('Could not load custom India boundaries:', error);
      }
      
      // Then load the standard world data
      for (const source of geoJsonSources.slice(1)) { // Skip the India file for world data
        try {
          const response = await fetch(source);
          if (response.ok) {
            worldData = await response.json();
            break; // Use first successful source
          }
        } catch (error) {
          continue; // Try next source
        }
      }

      if (!worldData) {
        throw new Error('All world GeoJSON sources failed');
      }

      // Create the main world layer, excluding India if we have custom data
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

      // Add the custom India layer with complete J&K boundaries
      if (indiaData) {
        // Handle GeometryCollection by creating polygons directly from coordinates
        if (indiaData.type === 'GeometryCollection' && indiaData.geometries) {
          indiaData.geometries.forEach((geometry: any) => {
            let polygons: L.Polygon[] = [];
            
            if (geometry.type === 'MultiPolygon') {
              // Handle MultiPolygon: each element in coordinates is a polygon
              geometry.coordinates.forEach((polygonCoords: number[][][]) => {
                // Convert coordinates to LatLng format and create polygon
                const latLngs = polygonCoords[0].map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                
                const polygon = L.polygon(latLngs, {
                  fillColor: theme === 'dark' ? '#00ff41' : '#a06be0',
                  weight: 2,
                  opacity: 1,
                  color: theme === 'dark' ? '#00ff41' : '#a06be0',
                  fillOpacity: 0.3
                });
                
                polygon.bindTooltip('India', {
                  permanent: false,
                  sticky: true,
                  className: `terminal-tooltip terminal-tooltip-${theme}`
                });
                
                polygon.addTo(map);
                polygons.push(polygon);
              });
            } else if (geometry.type === 'Polygon') {
              // Handle single Polygon
              const latLngs = geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
              
              const polygon = L.polygon(latLngs, {
                fillColor: theme === 'dark' ? '#00ff41' : '#a06be0',
                weight: 2,
                opacity: 1,
                color: theme === 'dark' ? '#00ff41' : '#a06be0',
                fillOpacity: 0.8
              });
              
              polygon.bindTooltip('India', {
                permanent: false,
                sticky: true,
                className: `terminal-tooltip terminal-tooltip-${theme}`
              });
              
              polygon.addTo(map);
              polygons.push(polygon);
            }
          });
        }
      }
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
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true
    });

    // Set map background
    if (mapRef.current) {
      mapRef.current.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff';
    }

    return map;
  }, [mapConfig.center, mapConfig.zoom, theme]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map and all timeouts
    if (fitBoundsTimeoutRef.current) {
      clearTimeout(fitBoundsTimeoutRef.current);
      fitBoundsTimeoutRef.current = null;
    }
    if (invalidateSizeTimeoutRef.current) {
      clearTimeout(invalidateSizeTimeoutRef.current);
      invalidateSizeTimeoutRef.current = null;
    }
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (error) {
        console.warn('Error removing map:', error);
      }
      mapInstanceRef.current = null;
    }

    // Small delay to ensure DOM is ready
    initTimeoutRef.current = setTimeout(() => {
      // Double-check that we haven't been unmounted
      if (!mapRef.current) return;
      
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

        const markers: L.Marker[] = [];
        coordinates.forEach((coord) => {
          const marker = L.marker([coord.lat, coord.lng], { icon: markerIcon });
          marker.addTo(map);
          markers.push(marker);
        });

        // If there are multiple coordinates, fit bounds to show all markers
        if (coordinates.length > 1) {
          try {
            const group = L.featureGroup(markers);
            // Use a slight delay to ensure the map container is fully rendered
            fitBoundsTimeoutRef.current = setTimeout(() => {
              try {
                // Check if map is still valid and container exists before fitting bounds
                if (map && 
                    map.getContainer() && 
                    map.getContainer().parentNode && 
                    map.getContainer().offsetWidth > 0 &&
                    map.getContainer().offsetHeight > 0) {
                  map.fitBounds(group.getBounds(), { 
                    padding: [20, 20],
                    animate: false // Disable animation to prevent transition errors
                  });
                }
              } catch (error) {
                console.warn('Error fitting bounds:', error);
              }
            }, 100); // Increased delay for better stability
          } catch (error) {
            console.warn('Error creating feature group for bounds:', error);
          }
        }
      } else {
        // Default: add tile layer for basic map
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          className: `terminal-tiles terminal-tiles-${theme}`
        });
        tileLayer.addTo(map);
      }

      mapInstanceRef.current = map;
      
      // Force Leaflet to recalculate sizes and positions after everything is set up
      invalidateSizeTimeoutRef.current = setTimeout(() => {
        if (map && 
            map.getContainer() && 
            map.getContainer().parentNode &&
            map.getContainer().offsetWidth > 0 &&
            map.getContainer().offsetHeight > 0) {
          try {
            map.invalidateSize({ animate: false, pan: false });
          } catch (error) {
            console.warn('Error invalidating map size:', error);
          }
        }
      }, 150);
    }, 100);

    // Cleanup function
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      if (fitBoundsTimeoutRef.current) {
        clearTimeout(fitBoundsTimeoutRef.current);
        fitBoundsTimeoutRef.current = null;
      }
      if (invalidateSizeTimeoutRef.current) {
        clearTimeout(invalidateSizeTimeoutRef.current);
        invalidateSizeTimeoutRef.current = null;
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Error cleaning up map:', error);
        }
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

  // Handle coordinate changes without reinitializing the entire map
  useEffect(() => {
    if (!mapInstanceRef.current || mapConfig.isWorldMapMode) return;
    
    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    
    if (coordinates.length > 0) {
      // Add new markers
      const markers: L.Marker[] = [];
      coordinates.forEach((coord) => {
        const marker = L.marker([coord.lat, coord.lng], { icon: markerIcon });
        marker.addTo(map);
        markers.push(marker);
      });

      // Animate to new bounds or center
      if (coordinates.length === 1) {
        // Single location - animate to center
        map.setView([coordinates[0].lat, coordinates[0].lng], zoom, {
          animate: true,
          duration: 1.0
        });
      } else if (coordinates.length > 1) {
        // Multiple locations - animate to fit all
        try {
          const group = L.featureGroup(markers);
          map.fitBounds(group.getBounds(), { 
            padding: [20, 20],
            animate: true,
            duration: 1.0
          });
        } catch (error) {
          console.warn('Error fitting bounds during animation:', error);
        }
      }
    }
  }, [coordinates, zoom, markerIcon, mapConfig.isWorldMapMode]);

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