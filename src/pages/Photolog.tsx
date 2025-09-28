import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, ThemeProvider, createTheme } from '@mui/material';
import './Photolog.css';
import './shared.css';
import './history.css';
import photologData from '../data/photolog.json';
import visitedData from '../data/visited.json';
import TerminalMap from '../components/TerminalMap';
import PhotoGallery from '../components/PhotoGallery';

interface PhotologProps {
  theme: 'light' | 'dark';
}

interface Country {
  name: string;
  flag: string;
  code: string;
}

interface PhotologLocation {
  location: string;
  country: string;
  colorN: number;
  coordinates: { lat: number; lng: number }[];
  dates: { date: string; basedOutOf: boolean }[];
  places: string[];
}

interface PhotologData {
  visitedCountries: Country[];
  locations: PhotologLocation[];
}

const Photolog = ({ theme }: PhotologProps) => {
  const [locations, setLocations] = useState<PhotologLocation[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<PhotologLocation[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [previousIdx, setPreviousIdx] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Create Material-UI theme based on current theme
  const muiTheme = createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: theme === 'dark' ? '#00ff41' : '#a06be0',
      },
      background: {
        default: theme === 'dark' ? '#111' : '#fff',
        paper: theme === 'dark' ? '#111' : '#fff',
      },
      text: {
        primary: theme === 'dark' ? '#fff' : '#111',
      },
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontFamily: "'Fira Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
            fontSize: '14px',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontFamily: "'Fira Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
            fontSize: '14px',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: "'Fira Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
            fontSize: '14px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: theme === 'dark' ? '#111' : '#fff',
            color: theme === 'dark' ? '#fff' : '#111',
            border: `1px solid ${theme === 'dark' ? '#fff' : '#111'}`,
          },
        },
      },
      MuiModal: {
        styleOverrides: {
          root: {
            overflow: 'visible !important',
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          root: {
            overflow: 'visible !important',
          },
        },
      },
    },
  });

  useEffect(() => {
    const data = photologData as PhotologData;
    setLocations(data.locations);
    setCountries(data.visitedCountries);
    setFilteredLocations(data.locations);
  }, []);

  // Get countries from the loaded data
  const getCountries = () => {
    return countries.map(country => ({
      key: country.code,
      value: country.code,
      text: country.flag
    }));
  };

  // Get location options for dropdown
  const getLocationOptions = () => {
    return filteredLocations.map((loc) => ({
      key: loc.location,
      value: loc.location,
      text: loc.location
    }));
  };

  // Calculate country bounds from all locations in a country
  const getCountryBounds = (countryCode: string) => {
    const countryLocations = locations.filter(loc => loc.country === countryCode);
    if (countryLocations.length === 0) return [];
    
    // Flatten all coordinates from all locations in the country
    const allCoordinates = countryLocations.reduce((acc, loc) => {
      return acc.concat(loc.coordinates);
    }, [] as { lat: number; lng: number }[]);
    
    return allCoordinates;
  };

  // Filter locations by selected country
  useEffect(() => {
    if (selectedCountry === '') {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(loc => loc.country === selectedCountry);
      setFilteredLocations(filtered);
    }
    setOpenIdx(null); // Reset expanded location when filtering
  }, [selectedCountry, locations]);

  // Handle country selection
  const handleCountryChange = (event: SelectChangeEvent) => {
    const countryCode = event.target.value;
    if (countryCode === "🇺🇳") {
      setSelectedCountry('');
    } else {
      setSelectedCountry(countryCode);
    }
    setSelectedLocation(''); // Reset location when country changes
    setOpenIdx(null);
  };

  // Handle location selection
  const handleLocationChange = (event: SelectChangeEvent) => {
    const locationName = event.target.value;
    if (locationName === "nil") {
      setSelectedLocation('');
    } else {
      setSelectedLocation(locationName);
    }
    
    if (locationName && locationName !== "nil") {
      const locationIndex = filteredLocations.findIndex(loc => loc.location === locationName);
      if (locationIndex !== -1) {
        handleToggle(locationIndex);
      }
    } else {
      setOpenIdx(null);
    }
  };

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  // Animation duration should match CSS transition (180ms)
  const ANIMATION_DURATION = 180;

  const handleToggle = (idx: number) => {
    if (openIdx !== null && openIdx !== idx) {
      // Switching from one location to another
      setIsTransitioning(true);
      setPreviousIdx(openIdx); // Keep track of current selection
      setOpenIdx(null);
      
      setTimeout(() => {
        setOpenIdx(idx);
        setIsTransitioning(false);
        setPreviousIdx(null);
      }, ANIMATION_DURATION);
    } else {
      // Opening for first time or closing current
      if (openIdx === idx) {
        // Closing current selection
        setPreviousIdx(openIdx);
        setOpenIdx(null);
        setTimeout(() => {
          setPreviousIdx(null);
        }, ANIMATION_DURATION);
      } else {
        // Opening for first time
        setOpenIdx(idx);
      }
    }
  };

  // Utility to color first N chars
  const colorFirstN = (text: string, n: number) => (
    <>
      <span className="secondary">{text.slice(0, n)}</span>{text.slice(n)}
    </>
  );

  // Utility to render dates with primary color first character for basedOutOf dates
  const renderDates = (dates: { date: string; basedOutOf: boolean }[], className: string) => (
    <span className={className}>
      {dates.map((dateObj, index) => (
        <span key={index}>
          {dateObj.basedOutOf ? 
            <strong><em><span className="secondary">{dateObj.date.charAt(0)}</span>{dateObj.date.slice(1)}</em></strong>
            : dateObj.date}
          {index < dates.length - 1 ? ', ' : ''}
        </span>
      ))}
    </span>
  );

  // Check if location has any basedOutOf dates
  const hasBasedOutOfDates = (dates: { date: string; basedOutOf: boolean }[]) => 
    dates.some(dateObj => dateObj.basedOutOf);

  return (
    <div className={`photolog-container ${theme}`}>
      <h2 className="section-title">
        travel &gt; <span className="secondary">photos.log</span>
      </h2>
      <div className="section-content">
        {/* Legend for based out of locations - now above dropdown */}
        <div className="location-legend">
          <span className="legend-text">
            Dates use the <a className="holocene-calendar" href="https://en.wikipedia.org/wiki/Holocene_calendar">Holocene Calendar</a> — <a className="holocene-calendar" href="https://www.youtube.com/web?v=czgOWmtGVGs">the Human Era</a>.<br/>
            <span style={{marginTop: '0.3em', display: 'inline-block'}}>
              <strong>b</strong>&<em>i</em>: places I've been based out of. <span className="secondary">■</span>
            </span>
          </span>
        </div>
        {/* Filter Controls - now below legend */}
        <ThemeProvider theme={muiTheme}>
          <div className="photolog-filters">
            <div className="photolog-filters-left">
              <FormControl sx={{ m: 1, minWidth: 80 }}>
                <InputLabel id="country-select-label">ctry</InputLabel>
                <Select
                  labelId="country-select-label"
                  id="country-select"
                  value={selectedCountry || "🇺🇳"}
                  label="ctry"
                  onChange={handleCountryChange}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected || selected === "🇺🇳") {
                      return "🇺🇳";
                    }
                    // Find the country and return its flag
                    const country = countries.find(c => c.code === selected);
                    return country ? country.flag : selected;
                  }}
                  MenuProps={{
                    disableScrollLock: true,
                  }}
                >
                  <MenuItem value="🇺🇳">
                    🇺🇳
                  </MenuItem>
                  {getCountries().map(({ key, value, text }) => (
                    <MenuItem key={key} value={value}>
                      {text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ m: 1, minWidth: 180 }}>
                <InputLabel id="location-select-label">Location</InputLabel>
                <Select
                  labelId="location-select-label"
                  id="location-select"
                  value={selectedLocation || "nil"}
                  label="Location"
                  onChange={handleLocationChange}
                  disabled={!selectedCountry}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected || selected === "nil") {
                      return "nil";
                    }
                    return selected;
                  }}
                  MenuProps={{
                    disableScrollLock: true,
                  }}
                >
                  <MenuItem value="nil">
                    nil
                  </MenuItem>
                  {getLocationOptions().map(({ key, value, text }) => (
                    <MenuItem key={key} value={value}>
                      {text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            
            {/* Show dates on the right when location is selected */}
            {selectedLocation && selectedLocation !== "nil" && (
              <div className="photolog-filters-right">
                {(() => {
                  const selectedLocationData = filteredLocations.find(loc => loc.location === selectedLocation);
                  return selectedLocationData ? (
                    <div className="location-dates">
                      {renderDates(selectedLocationData.dates, "date-text")}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </ThemeProvider>

        <div className="photolog-layout">
          {/* Full Screen Map Section */}
          <div className="photolog-map-section">
            <div className="location-map-container" style={{ position: 'relative' }}>
              <TerminalMap
                coordinates={
                  // If a specific location is selected, show its coordinates
                  (openIdx !== null || (isTransitioning && previousIdx !== null)) && 
                  filteredLocations[openIdx !== null ? openIdx : previousIdx!] 
                    ? filteredLocations[openIdx !== null ? openIdx : previousIdx!].coordinates || []
                    // If a country is selected but no specific location, show all country coordinates
                    : selectedCountry && !selectedLocation
                    ? getCountryBounds(selectedCountry)
                    : []
                }
                visitedCountries={
                  // Show world view only when no country or location is selected
                  (!selectedCountry && openIdx === null && !isTransitioning && previousIdx === null)
                    ? visitedData.visitedCountries as any
                    : undefined
                }
                theme={theme}
                zoom={
                  // Specific location selected - high zoom
                  (openIdx !== null || (isTransitioning && previousIdx !== null)) && 
                  filteredLocations[openIdx !== null ? openIdx : previousIdx!] 
                    ? 11 
                    // Country selected but no location - medium zoom to fit country
                    : selectedCountry && !selectedLocation
                    ? 5
                    // World view - low zoom
                    : 1.4
                }
                height={isMobile ? 300 : 400}
                width={isMobile ? Math.min(windowWidth - 40, 350) : 840}
                forceWorldView={
                  // Force world view only when nothing is selected
                  (!selectedCountry && openIdx === null && !isTransitioning && previousIdx === null)
                }
              />
              {(isTransitioning || (openIdx === null && previousIdx !== null)) && (
                <div className="map-loading-overlay" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.9)',
                  zIndex: 10
                }}>
                  <span className="secondary">Loading...</span>
                </div>
              )}
              {!isTransitioning && (!selectedCountry && openIdx === null && previousIdx === null) && (
                <div className="map-overlay-text" style={{
                  position: 'absolute',
                  bottom: '30px',
                  left: '80px',
                  color: 'var(--text-color)',
                  fontSize: '14px',
                  zIndex: 5
                }}>
                  Countries I've been to. <span className="secondary">■</span>
                </div>
              )}
              {!isTransitioning && selectedCountry && !selectedLocation && (
                <div className="map-overlay-text" style={{
                  position: 'absolute',
                  bottom: '30px',
                  left: '80px',
                  color: 'var(--text-color)',
                  fontSize: '14px',
                  zIndex: 5
                }}>
                  {countries.find(c => c.code === selectedCountry)?.flag} {countries.find(c => c.code === selectedCountry)?.name} locations. <span className="secondary">■</span>
                </div>
              )}
            </div>
            <div className="location-dates-container">
            </div>
          </div>

          {/* Location List Section - Now Empty */}
          <div className="photolog-list-section">
          </div>
        </div>
        
        {/* Photos Gallery */}
        <PhotoGallery theme={theme} />
      </div>
    </div>
  );
};

export { Photolog };
export default Photolog;
