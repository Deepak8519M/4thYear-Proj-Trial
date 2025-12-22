import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
Info,
Navigation2,
Share2,
Target,
RefreshCw
} from 'lucide-react';

/\*\*

- Enhanced Hospital Locator Application
- Features: Auto-location, Adjustable Radius, Sharing, and Advanced Sorting.
  \*/

const App = () => {
// --- State Management ---
const [searchQuery, setSearchQuery] = useState('');
const [loading, setLoading] = useState(false);
const [hospitals, setHospitals] = useState([]);
const [error, setError] = useState(null);
const [userCoords, setUserCoords] = useState(null);
const [radius, setRadius] = useState(10000); // Default 10km in meters
const [filters, setFilters] = useState({
type: 'all',
emergencyOnly: false,
sortBy: 'distance'
});

// --- Utility: Calculate Distance (Haversine Formula) ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
const R = 6371;
const dLat = (lat2 - lat1) _ Math.PI / 180;
const dLon = (lon2 - lon1) _ Math.PI / 180;
const a =
Math.sin(dLat/2) _ Math.sin(dLat/2) +
Math.cos(lat1 _ Math.PI / 180) _ Math.cos(lat2 _ Math.PI / 180) _ Math.sin(dLon/2) _ Math.sin(dLon/2);
const c = 2 _ Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
return (R _ c).toFixed(1);
};

// --- Core Logic: Fetch POIs from Overpass ---
const fetchHospitals = useCallback(async (lat, lon, locationName) => {
setLoading(true);
setError(null);
try {
setUserCoords({ lat, lon, name: locationName });

      const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lon});way["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lon});relation["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lon}););out center;`;

      const hospitalRes = await fetch(overpassUrl);
      const hospitalData = await hospitalRes.json();

      const processed = (hospitalData.elements || []).map(item => {
        const tags = item.tags || {};
        const hLat = item.lat || item.center?.lat;
        const hLon = item.lon || item.center?.lon;

        return {
          id: item.id,
          name: tags.name || 'Unnamed Healthcare Center',
          type: tags.amenity === 'hospital' ? 'Hospital' : (tags.amenity === 'clinic' ? 'Clinic' : 'Medical Center'),
          address: [
            tags['addr:housenumber'],
            tags['addr:street'],
            tags['addr:suburb'],
            tags['addr:city']
          ].filter(Boolean).join(', ') || tags['addr:full'] || 'Address not listed',
          phone: tags.phone || tags['contact:phone'] || '',
          emergency: tags.emergency === 'yes' ? 'Available' : 'Not Specified',
          hours: tags.opening_hours || 'Contact for timing',
          specialty: tags.healthcare?.replace(/_/g, ' ') || tags.speciality || 'General Services',
          lat: hLat,
          lon: hLon,
          distance: calculateDistance(lat, lon, hLat, hLon)
        };
      });

      setHospitals(processed);
    } catch (err) {
      setError("Failed to fetch nearby medical facilities. Please try again.");
    } finally {
      setLoading(false);
    }

}, [radius]);

// --- Action: Manual Search ---
const handleSearch = async (e) => {
if (e) e.preventDefault();
if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
      const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'MediLocate/2.0' } });
      const geoData = await geoRes.json();

      if (geoData.length === 0) throw new Error("Location not found. Try a specific city or pincode.");

      const { lat, lon, display_name } = geoData[0];
      fetchHospitals(parseFloat(lat), parseFloat(lon), display_name);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }

};

// --- Action: Auto-Locate User ---
const handleLocateMe = () => {
if (!navigator.geolocation) {
setError("Geolocation is not supported by your browser.");
return;
}

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSearchQuery("Current Location");
        fetchHospitals(latitude, longitude, "Your Current Location");
      },
      () => {
        setError("Location access denied. Please enter your location manually.");
        setLoading(false);
      }
    );

};

// --- Action: Share Hospital ---
const handleShare = (hospital) => {
const text = `Check out ${hospital.name} in ${hospital.address}. Distance: ${hospital.distance}km. Emergency: ${hospital.emergency}.`;
if (navigator.share) {
navigator.share({
title: hospital.name,
text: text,
url: `https://www.openstreetmap.org/?mlat=${hospital.lat}&mlon=${hospital.lon}`
}).catch(() => {});
} else {
// Fallback: Copy to clipboard
const el = document.createElement('textarea');
el.value = text;
document.body.appendChild(el);
el.select();
document.execCommand('copy');
document.body.removeChild(el);
// Custom toast or message would go here
}
};

// --- Computed: Filtering & Sorting ---
const filteredHospitals = useMemo(() => {
let list = [...hospitals];
if (filters.emergencyOnly) list = list.filter(h => h.emergency === 'Available');
if (filters.type !== 'all') list = list.filter(h => h.type.toLowerCase() === filters.type.toLowerCase());

    list.sort((a, b) => {
      if (filters.sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance);
      if (filters.sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return list;

}, [hospitals, filters]);

const openNavigation = (lat, lon) => {
const url = `https://www.openstreetmap.org/directions?from=&to=${lat}%2C${lon}`;
window.open(url, '\_blank');
};

return (
<div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
{/_ Dynamic Header _/}
<header className="bg-white border-b sticky top-0 z-30 shadow-sm">
<div className="max-w-7xl mx-auto px-4 py-4">
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
<div className="flex items-center gap-3">
<div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-200">
<Activity className="text-white w-6 h-6" />
</div>
<div>
<h1 className="text-xl font-extrabold tracking-tight text-slate-800">MediLocate</h1>
<p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Smart Health Finder</p>
</div>
</div>

            <div className="flex flex-1 max-w-2xl gap-2">
              <form onSubmit={handleSearch} className="flex-1 relative group">
                <input
                  type="text"
                  placeholder="Enter area, city, or pincode..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-100 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <button
                  type="button"
                  onClick={handleLocateMe}
                  title="Use My Location"
                  className="absolute right-3 top-2.5 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Target className="w-5 h-5" />
                </button>
              </form>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-100 flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Search"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Empty Search State */}
        {!userCoords && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white p-8 rounded-full shadow-xl border border-blue-50">
                <MapPin className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3">Find Care Instantly</h2>
            <p className="text-slate-500 max-w-md text-lg leading-relaxed">
              Use your current location or enter a city to find the nearest hospitals, clinics, and emergency centers.
            </p>
            <div className="mt-8 flex gap-4">
               <button onClick={handleLocateMe} className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2">
                 <Target className="w-5 h-5" /> Locate Me
               </button>
            </div>
          </div>
        )}

        {userCoords && (
          <>
            {/* Controls Bar */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Navigation2 className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold uppercase tracking-widest">Active Search Area</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 truncate max-w-lg">{userCoords.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full border">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="font-semibold">{filteredHospitals.length} Facilities</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="font-semibold">{hospitals.filter(h => h.emergency === 'Available').length} Emergency</span>
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Radius</span>
                  <select
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                  >
                    <option value={5000}>5 KM</option>
                    <option value={10000}>10 KM</option>
                    <option value={20000}>20 KM</option>
                    <option value={50000}>50 KM</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sort By</span>
                  <select
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                    value={filters.sortBy}
                    onChange={(e) => setFilters(f => ({...f, sortBy: e.target.value}))}
                  >
                    <option value="distance">Nearest First</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Type</span>
                  <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setFilters(f => ({...f, type: 'all'}))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filters.type === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >All</button>
                    <button
                      onClick={() => setFilters(f => ({...f, type: 'hospital'}))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filters.type === 'hospital' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >Hospitals</button>
                  </div>
                </div>

                <button
                  onClick={() => setFilters(f => ({...f, emergencyOnly: !f.emergencyOnly}))}
                  className={`mt-5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    filters.emergencyOnly
                      ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Emergency Only
                </button>
              </div>
            </div>

            {/* Grid Layout */}
            {!loading && filteredHospitals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="bg-white rounded-[2rem] border border-slate-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group overflow-hidden flex flex-col"
                  >
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                          hospital.type === 'Hospital' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {hospital.type}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] bg-slate-50 px-2 py-1 rounded-lg">
                          <Navigation className="w-3 h-3 text-blue-500" />
                          {hospital.distance} KM
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 leading-snug mb-3 min-h-[3rem] group-hover:text-blue-600 transition-colors">
                        {hospital.name}
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                          </div>
                          <span className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">{hospital.address}</span>
                        </div>

                        {hospital.phone && (
                          <a
                            href={`tel:${hospital.phone}`}
                            className="flex items-center gap-3 group/phone hover:bg-blue-50 p-1 -ml-1 rounded-lg transition-all"
                          >
                            <div className="p-1.5 bg-slate-50 rounded-lg group-hover/phone:bg-blue-100">
                              <Phone className="w-4 h-4 text-slate-400 group-hover/phone:text-blue-600" />
                            </div>
                            <span className="text-sm text-slate-600 font-bold group-hover/phone:text-blue-600">{hospital.phone}</span>
                          </a>
                        )}

                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-slate-50 rounded-lg">
                            <Stethoscope className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-sm text-slate-500 font-medium italic">{hospital.specialty}</span>
                        </div>

                        {hospital.emergency === 'Available' && (
                          <div className="flex items-center gap-2.5 text-xs font-black text-rose-600 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100">
                            <Activity className="w-3.5 h-3.5 animate-pulse" />
                            24/7 EMERGENCY CARE
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2">
                       <button
                        onClick={() => handleShare(hospital)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Share Location"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openNavigation(hospital.lat, hospital.lon)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                      >
                        <Navigation2 className="w-4 h-4" />
                        Navigate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* State Indicators */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-bold animate-pulse">Scanning nearby medical databases...</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto bg-rose-50 border-2 border-rose-100 p-6 rounded-[2rem] flex items-start gap-4">
            <div className="bg-rose-600 p-2 rounded-xl">
              <AlertCircle className="text-white w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-rose-900">Oops! Something went wrong</h4>
              <p className="text-rose-700 font-medium mb-3">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs font-black uppercase text-rose-600 tracking-widest hover:underline"
              >Dismiss Error</button>
            </div>
          </div>
        )}

        {userCoords && !loading && !error && filteredHospitals.length === 0 && (
          <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200">
            <Search className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-800 mb-2">No facilities found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">We couldn't find any results matching your filters within {radius/1000}km.</p>
            <button
              onClick={() => setRadius(r => r + 10000)}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:scale-105 transition-all"
            >
              Expand Search Radius
            </button>
          </div>
        )}

        {/* Enhanced Footer */}
        <footer className="mt-24 pt-12 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-slate-500 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-blue-600 w-5 h-5" />
                <span className="font-black text-slate-800 tracking-tight">MediLocate</span>
              </div>
              <p className="text-sm leading-relaxed">Providing fast, open-access medical location services worldwide. Helping you find the care you need when every second counts.</p>
            </div>
            <div className="bg-slate-100 p-6 rounded-3xl col-span-2">
               <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="text-xs space-y-2 leading-relaxed">
                  <p className="font-bold text-slate-800 text-sm">Medical Disclaimer</p>
                  <p>MediLocate is an information tool and not a medical advisory service. Facility data is crowdsourced via OpenStreetMap and might not be 100% accurate or up-to-date. In case of a life-threatening emergency, please dial your local emergency services number (e.g., 911, 112, 102) immediately.</p>
                  <p>© {new Date().getFullYear()} MediLocate Intelligence. Global Open Data Initiative.</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>

);
};

export default App;
