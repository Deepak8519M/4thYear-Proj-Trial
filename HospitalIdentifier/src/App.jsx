import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  AlertCircle, 
  Filter, 
  Stethoscope, 
  Activity,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

/**
 * Hospital Locator Application
 * Uses Nominatim for Geocoding and Overpass API for POI data.
 */

const App = () => {
  // --- State Management ---
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    emergencyOnly: false,
    sortBy: 'distance'
  });

  // --- Utility: Calculate Distance (Haversine Formula) ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // --- Data Fetching: Geocoding (Nominatim) ---
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Get Coordinates for the search query
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
      const geoRes = await fetch(geoUrl, {
        headers: { 'User-Agent': 'NearbyHospitalLocatorApp/1.0' }
      });
      const geoData = await geoRes.json();

      if (geoData.length === 0) {
        throw new Error("Location not found. Try entering a city or pincode.");
      }

      const { lat, lon, display_name } = geoData[0];
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      setUserCoords({ lat: latNum, lon: lonNum, name: display_name });

      // 2. Fetch Nearby Hospitals using Overpass API
      // Searching for amenity=hospital or amenity=clinic within 10km radius
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node["amenity"~"hospital|clinic|doctors"](around:10000,${latNum},${lonNum});way["amenity"~"hospital|clinic|doctors"](around:10000,${latNum},${lonNum});relation["amenity"~"hospital|clinic|doctors"](around:10000,${latNum},${lonNum}););out center;`;
      
      const hospitalRes = await fetch(overpassUrl);
      const hospitalData = await hospitalRes.json();

      const processed = (hospitalData.elements || []).map(item => {
        const tags = item.tags || {};
        const hLat = item.lat || item.center?.lat;
        const hLon = item.lon || item.center?.lon;

        return {
          id: item.id,
          name: tags.name || 'Unnamed Healthcare Center',
          type: tags.amenity === 'hospital' ? 'Hospital' : (tags.amenity === 'clinic' ? 'Clinic' : 'General Practice'),
          address: [
            tags['addr:street'],
            tags['addr:suburb'],
            tags['addr:city'],
            tags['addr:postcode']
          ].filter(Boolean).join(', ') || 'Address not listed',
          phone: tags.phone || tags['contact:phone'] || 'N/A',
          emergency: tags.emergency === 'yes' ? 'Available' : 'Not Specified',
          hours: tags.opening_hours || 'Contact for timing',
          specialty: tags.healthcare?.replace(/_/g, ' ') || tags.speciality || 'General Medicine',
          lat: hLat,
          lon: hLon,
          distance: calculateDistance(latNum, lonNum, hLat, hLon)
        };
      });

      setHospitals(processed);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering & Sorting ---
  const filteredHospitals = useMemo(() => {
    let list = [...hospitals];

    if (filters.emergencyOnly) {
      list = list.filter(h => h.emergency === 'Available');
    }

    if (filters.type !== 'all') {
      list = list.filter(h => h.type.toLowerCase() === filters.type.toLowerCase());
    }

    list.sort((a, b) => {
      if (filters.sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance);
      if (filters.sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [hospitals, filters]);

  const openNavigation = (lat, lon) => {
    const url = `https://www.openstreetmap.org/directions?from=&to=${lat}%2C${lon}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">MediLocate</h1>
            </div>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
              <input 
                type="text"
                placeholder="Enter area, city, or pincode..."
                className="w-full pl-10 pr-24 py-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Intro / Location Status */}
        {!userCoords && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-blue-50 p-6 rounded-full mb-6">
              <MapPin className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Find Help Near You</h2>
            <p className="text-slate-500 max-w-md">
              Enter your location above to find hospitals, clinics, and emergency care centers within a 10km radius.
            </p>
          </div>
        )}

        {userCoords && (
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Search Results</span>
                <h2 className="text-2xl font-bold mt-1">Hospitals near {searchQuery}</h2>
                <p className="text-slate-500 text-sm mt-1 truncate max-w-md">{userCoords.name}</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border text-sm">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select 
                    className="bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                    value={filters.type}
                    onChange={(e) => setFilters(f => ({...f, type: e.target.value}))}
                  >
                    <option value="all">All Types</option>
                    <option value="hospital">Hospitals</option>
                    <option value="clinic">Clinics</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border text-sm">
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  <select 
                    className="bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                    value={filters.sortBy}
                    onChange={(e) => setFilters(f => ({...f, sortBy: e.target.value}))}
                  >
                    <option value="distance">By Distance</option>
                    <option value="name">By Name</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border text-sm cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={filters.emergencyOnly}
                    onChange={(e) => setFilters(f => ({...f, emergencyOnly: e.target.checked}))}
                  />
                  <span>Emergency Only</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white h-64 rounded-2xl border border-slate-200"></div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Search Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && filteredHospitals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <div 
                key={hospital.id} 
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all group overflow-hidden flex flex-col"
              >
                {/* Card Top */}
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                      hospital.type === 'Hospital' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {hospital.type}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                      <MapPin className="w-3 h-3" />
                      {hospital.distance} km
                    </div>
                  </div>

                  <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                    {hospital.name}
                  </h3>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                      <span className="line-clamp-2">{hospital.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      <span>{hospital.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Stethoscope className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      <span className="capitalize">{hospital.specialty}</span>
                    </div>

                    {hospital.emergency === 'Available' && (
                      <div className="flex items-center gap-2 text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg w-fit">
                        <Activity className="w-4 h-4" />
                        <span>Emergency: 24/7 Available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer / Action */}
                <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{hospital.hours === 'Contact for timing' ? 'Check hours' : 'Open'}</span>
                  </div>
                  <button 
                    onClick={() => openNavigation(hospital.lat, hospital.lon)}
                    className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {userCoords && !loading && !error && filteredHospitals.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No results found</h3>
            <p className="text-slate-500">Try adjusting your filters or searching for a broader area.</p>
          </div>
        )}

        {/* Disclaimer */}
        <footer className="mt-16 pt-8 border-t border-slate-200 text-center">
          <div className="bg-slate-100 rounded-2xl p-6 max-w-2xl mx-auto flex items-start gap-4 text-left">
            <Info className="w-6 h-6 text-slate-400 mt-1 flex-shrink-0" />
            <div className="text-sm text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-700 mb-1">Disclaimer & Privacy</p>
              This feature is intended for informational and navigation assistance only. Data is sourced from OpenStreetMap contributors. Hospital availability, specialties, and emergency services may vary. Users are strongly advised to contact the facility directly before visiting for critical care. 
              <br /><br />
              © {new Date().getFullYear()} MediLocate. Powered by OpenStreetMap.
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default App;