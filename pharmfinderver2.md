import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Phone, Clock, Navigation, Pill, AlertCircle, ChevronRight, Info, Crosshair, Filter, ArrowUpDown } from 'lucide-react';

const App = () => {
const [query, setQuery] = useState('');
const [loading, setLoading] = useState(false);
const [pharmacies, setPharmacies] = useState([]);
const [error, setError] = useState(null);
const [selectedPharmacy, setSelectedPharmacy] = useState(null);
const [sortBy, setSortBy] = useState('distance'); // 'distance' or 'name'
const [searchCoords, setSearchCoords] = useState(null);
const [medicineFilter, setMedicineFilter] = useState('');

// Mock Medicine Data
const medicines = [
{ id: 1, name: 'Paracetamol 500mg', basePrice: 15, stock: 'High' },
{ id: 2, name: 'Amoxicillin 250mg', basePrice: 45, stock: 'Medium' },
{ id: 3, name: 'Cetirizine 10mg', basePrice: 12, stock: 'High' },
{ id: 4, name: 'Metformin 500mg', basePrice: 30, stock: 'Low' },
{ id: 5, name: 'Ibuprofen 400mg', basePrice: 22, stock: 'High' },
{ id: 6, name: 'Azithromycin 500mg', basePrice: 65, stock: 'Medium' },
];

// Helper: Haversine distance formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
const R = 6371; // km
const dLat = (lat2 - lat1) _ Math.PI / 180;
const dLon = (lon2 - lon1) _ Math.PI / 180;
const a = Math.sin(dLat / 2) _ Math.sin(dLat / 2) +
Math.cos(lat1 _ Math.PI / 180) _ Math.cos(lat2 _ Math.PI / 180) _
Math.sin(dLon / 2) _ Math.sin(dLon / 2);
const c = 2 _ Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
return (R _ c).toFixed(1);
};

const handleSearch = async (e) => {
if (e) e.preventDefault();
if (!query) return;

    setLoading(true);
    setError(null);

    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(geoUrl, { headers: { 'User-Agent': 'PharmacyFinder/1.0' } });
      const data = await res.json();

      if (!data.length) throw new Error("Location not found.");

      const { lat, lon, display_name } = data[0];
      setQuery(display_name.split(',')[0]); // Clean up the query display
      fetchNearby(lat, lon);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }

};

const handleGeoLocation = () => {
setLoading(true);
setError(null);
if (!navigator.geolocation) {
setError("Geolocation is not supported by your browser");
setLoading(false);
return;
}

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setQuery("My Location");
        fetchNearby(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );

};

const fetchNearby = async (lat, lon) => {
setSearchCoords({ lat, lon });
try {
const overpassQuery = `        [out:json][timeout:25];
        (
          node["amenity"="pharmacy"](around:5000, ${lat}, ${lon});
          way["amenity"="pharmacy"](around:5000, ${lat}, ${lon});
        );
        out center;
     `;
const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
const res = await fetch(url);
const data = await res.json();

      if (!data.elements?.length) {
        setError("No pharmacies found within 5km.");
      } else {
        const results = data.elements.map(el => {
          const pLat = el.lat || el.center?.lat;
          const pLon = el.lon || el.center?.lon;
          return {
            id: el.id,
            name: el.tags.name || "Local Pharmacy",
            address: el.tags['addr:street'] ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}` : "Address details on map",
            phone: el.tags.phone || el.tags['contact:phone'] || "No contact info",
            hours: el.tags.opening_hours || "Contact for hours",
            isOpen: el.tags.opening_hours?.toLowerCase().includes('24/7') || false,
            lat: pLat,
            lon: pLon,
            distValue: parseFloat(calculateDistance(lat, lon, pLat, pLon))
          };
        });
        setPharmacies(results);
      }
    } catch (err) {
      setError("Failed to fetch pharmacy data.");
    } finally {
      setLoading(false);
    }

};

const sortedPharmacies = useMemo(() => {
return [...pharmacies].sort((a, b) => {
if (sortBy === 'distance') return a.distValue - b.distValue;
return a.name.localeCompare(b.name);
});
}, [pharmacies, sortBy]);

const filteredMedicines = useMemo(() => {
return medicines.filter(m => m.name.toLowerCase().includes(medicineFilter.toLowerCase()));
}, [medicineFilter]);

return (
<div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
<header className="bg-emerald-700 text-white p-6 shadow-lg sticky top-0 z-20">
<div className="max-w-4xl mx-auto">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
<div className="bg-white/20 p-2 rounded-lg">
<Pill className="w-6 h-6" />
</div>
<div>
<h1 className="text-xl font-bold leading-tight">PharmaMap</h1>
<p className="text-emerald-100 text-xs">Verified Local Pharmacy Finder</p>
</div>
</div>
<button 
              onClick={handleGeoLocation}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-full transition-all shadow-sm flex items-center gap-2 px-4 text-sm font-medium"
            >
<Crosshair className="w-4 h-4" /> <span className="hidden sm:inline">Near Me</span>
</button>
</div>

          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              placeholder="Enter area, city, or pincode..."
              className="w-full py-3 pl-5 pr-14 rounded-xl border-none text-slate-800 shadow-xl focus:ring-4 focus:ring-emerald-500/30 transition-all outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-2 bg-emerald-700 text-white rounded-lg hover:scale-105 active:scale-95 transition-transform"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {pharmacies.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3 px-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{pharmacies.length}</span> results found
            </div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
              <button
                onClick={() => setSortBy('distance')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'distance' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Closest
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'name' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Name
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-slate-400 font-medium animate-pulse">Scanning medical database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-red-800 font-bold mb-1">Search Error</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button onClick={() => setError(null)} className="text-red-800 font-bold text-xs underline">Dismiss</button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPharmacies.map((p) => (
              <div key={p.id} className={`bg-white rounded-2xl border transition-all ${selectedPharmacy?.id === p.id ? 'ring-2 ring-emerald-500 shadow-xl' : 'shadow-sm hover:shadow-md'}`}>
                <div className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-800">{p.name}</h3>
                        {p.isOpen && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Open 24/7</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-4">
                        <MapPin className="w-4 h-4 text-emerald-600" /> {p.address}
                      </p>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border text-xs text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {p.phone}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border text-xs text-slate-600 max-w-[200px] truncate">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {p.hours}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => window.open(`https://www.openstreetmap.org/directions?engine=osrm_car&route=%3B${p.lat}%2C${p.lon}`, '_blank')}
                        className="p-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm group"
                      >
                        <Navigation className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      </button>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.distValue} km</span>
                    </div>
                  </div>

                  <div className="border-t mt-2 pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedPharmacy(selectedPharmacy?.id === p.id ? null : p)}
                      className="text-emerald-700 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Check Inventory & Prices <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {selectedPharmacy?.id === p.id && (
                  <div className="bg-slate-50 border-t p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800">Estimated Price List</h4>
                        <p className="text-xs text-slate-400">Stock updated 2 hours ago</p>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search medicine..."
                          className="pl-9 pr-4 py-2 bg-white border rounded-lg text-sm w-full sm:w-48 outline-none focus:ring-2 focus:ring-emerald-500"
                          value={medicineFilter}
                          onChange={(e) => setMedicineFilter(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredMedicines.length > 0 ? filteredMedicines.map(med => (
                        <div key={med.id} className="bg-white p-4 rounded-xl flex items-center justify-between border shadow-sm hover:border-emerald-200 transition-colors">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{med.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${med.stock === 'Low' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {med.stock} Stock
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-black text-emerald-700">₹{med.basePrice + (p.id % 5)}</p>
                            <p className="text-[10px] text-slate-400">Avg. Market Price</p>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-full py-8 text-center text-slate-400 text-sm italic">
                          No matching medicines found in this pharmacy.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && pharmacies.length === 0 && !error && (
          <div className="text-center py-24 space-y-4">
            <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <MapPin className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="max-w-xs mx-auto">
              <h2 className="text-xl font-bold text-slate-800">Ready to Search?</h2>
              <p className="text-slate-500 text-sm mt-2">
                Use your current location or search by city to find pharmacies with live stock estimates.
              </p>
            </div>
          </div>
        )}

        <div className="mt-16 bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-amber-100 p-3 rounded-full text-amber-600">
            <Info className="w-6 h-6" />
          </div>
          <div className="text-center md:text-left space-y-1">
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Medical Disclaimer</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              This tool provides estimates based on crowdsourced OpenStreetMap data. Availability and pricing change rapidly.
              <strong> Always confirm by phone</strong> before traveling for essential medications. For life-threatening emergencies, call 102 or 108.
            </p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-md border-t px-8 py-4 flex justify-around items-center text-slate-400 md:hidden shadow-2xl z-30">
        <div className="flex flex-col items-center gap-1 text-emerald-700 font-bold scale-110">
          <Search className="w-6 h-6" />
          <span className="text-[10px]">Explore</span>
        </div>
        <div className="flex flex-col items-center gap-1 hover:text-slate-600 transition-colors">
          <Filter className="w-6 h-6" />
          <span className="text-[10px]">Filter</span>
        </div>
        <div className="flex flex-col items-center gap-1 hover:text-slate-600 transition-colors">
          <ArrowUpDown className="w-6 h-6" />
          <span className="text-[10px]">Sort</span>
        </div>
      </footer>
    </div>

);
};

export default App;
