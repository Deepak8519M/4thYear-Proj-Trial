import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Clock, Navigation, Pill, AlertCircle, ChevronRight, Info } from 'lucide-react';

const App = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [priceView, setPriceView] = useState(false);

  // Mock Medicine Data for Price Comparison Module
  const medicines = [
    { id: 1, name: 'Paracetamol 500mg', basePrice: 15, stock: 'High' },
    { id: 2, name: 'Amoxicillin 250mg', basePrice: 45, stock: 'Medium' },
    { id: 3, name: 'Cetirizine 10mg', basePrice: 12, stock: 'High' },
    { id: 4, name: 'Metformin 500mg', basePrice: 30, stock: 'Low' },
  ];

  const searchPharmacies = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    setPharmacies([]);

    try {
      // Step 1: Geocode location using Nominatim (OpenStreetMap)
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const geoRes = await fetch(geoUrl, {
        headers: { 'User-Agent': 'PharmacyFinderApp/1.0' }
      });
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        throw new Error("Location not found. Please try a different area or pincode.");
      }

      const { lat, lon } = geoData[0];

      // Step 2: Query Overpass API for pharmacies within 3km of the coordinates
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="pharmacy"](around:3000, ${lat}, ${lon});
          way["amenity"="pharmacy"](around:3000, ${lat}, ${lon});
          relation["amenity"="pharmacy"](around:3000, ${lat}, ${lon});
        );
        out center;
      `;
      
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
      const pharmacyRes = await fetch(overpassUrl);
      const pharmacyData = await pharmacyRes.json();

      if (!pharmacyData.elements || pharmacyData.elements.length === 0) {
        setError("No pharmacies found within 3km of this location.");
      } else {
        const results = pharmacyData.elements.map(el => ({
          id: el.id,
          name: el.tags.name || "Unnamed Pharmacy",
          address: el.tags['addr:full'] || el.tags['addr:street'] || "Address not available",
          pincode: el.tags['addr:postcode'] || "N/A",
          phone: el.tags['phone'] || el.tags['contact:phone'] || "N/A",
          hours: el.tags['opening_hours'] || "Check with store",
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
          distance: "Nearby" // Simplified for demo
        }));
        setPharmacies(results);
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const openDirections = (lat, lon) => {
    // Standard URL for OpenStreetMap Directions or fallback to Apple/Google
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${lat}%2C${lon}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-emerald-600 text-white p-6 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Pill className="w-6 h-6" /> Local Pharmacy Finder
            </h1>
            <p className="text-emerald-100 text-sm">Find medicine availability near you</p>
          </div>
          
          <form onSubmit={searchPharmacies} className="relative flex-1 max-w-md w-full">
            <input
              type="text"
              placeholder="Enter City, Area or Pincode..."
              className="w-full py-2.5 pl-4 pr-12 rounded-full border-none text-slate-800 shadow-inner focus:ring-2 focus:ring-emerald-300"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="absolute right-1 top-1 p-2 bg-emerald-500 rounded-full hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Results Info */}
        {!loading && pharmacies.length > 0 && (
          <div className="mb-4 flex items-center justify-between px-2">
            <span className="text-sm font-medium text-slate-500">
              Found {pharmacies.length} pharmacies near "{query}"
            </span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500">Searching nearby pharmacies...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">{error}</p>
              <p className="text-red-600 text-sm">Try searching for a specific city or a 6-digit pincode.</p>
            </div>
          </div>
        )}

        {/* Pharmacy List */}
        {!loading && !error && pharmacies.length > 0 && (
          <div className="grid gap-4">
            {pharmacies.map((pharmacy) => (
              <div 
                key={pharmacy.id} 
                className={`bg-white rounded-2xl shadow-sm border transition-all overflow-hidden ${selectedPharmacy?.id === pharmacy.id ? 'ring-2 ring-emerald-500' : 'hover:border-emerald-200'}`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{pharmacy.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                        <MapPin className="w-4 h-4" /> {pharmacy.address} • {pharmacy.pincode}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 mb-4">
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                          <Phone className="w-3.5 h-3.5" /> {pharmacy.phone}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" /> {pharmacy.hours}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => openDirections(pharmacy.lat, pharmacy.lon)}
                      className="flex flex-col items-center justify-center p-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      <Navigation className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Directions</span>
                    </button>
                  </div>

                  <div className="border-t pt-4 flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedPharmacy(pharmacy)}
                      className="text-emerald-600 text-sm font-semibold flex items-center gap-1 hover:underline"
                    >
                      Compare Prices <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] text-slate-400 italic">3.2 km away</span>
                  </div>
                </div>

                {/* Price Module Overlay (Integrated) */}
                {selectedPharmacy?.id === pharmacy.id && (
                  <div className="bg-slate-50 border-t p-5 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-800 text-sm">Prices at {pharmacy.name}</h4>
                      <button 
                        onClick={() => setSelectedPharmacy(null)}
                        className="text-xs text-slate-400 uppercase tracking-tighter"
                      >
                        Close
                      </button>
                    </div>
                    <div className="space-y-3">
                      {medicines.map(med => (
                        <div key={med.id} className="bg-white p-3 rounded-lg flex items-center justify-between border border-slate-200">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{med.name}</p>
                            <p className="text-[10px] text-slate-400">Stock: <span className={med.stock === 'Low' ? 'text-orange-500' : 'text-emerald-500'}>{med.stock}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-700">₹{med.basePrice + Math.floor(Math.random() * 5)}</p>
                            <p className="text-[10px] line-through text-slate-300">MRP ₹{med.basePrice + 10}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && pharmacies.length === 0 && (
          <div className="text-center py-20 px-6">
            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Find a Pharmacy Near You</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Enter your area or pincode to discover pharmacies and check medicine availability.
            </p>
          </div>
        )}

        {/* Health Disclaimer */}
        <div className="mt-12 bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <p className="font-bold mb-1">Health & Pricing Disclaimer</p>
            <p>
              Information is sourced from OpenStreetMap and public databases. Real-time availability, operating hours, and medicine prices may vary by store. 
              Always call the pharmacy to confirm stock before visiting. In case of emergency, contact your local emergency number immediately.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Navigation (Optional placeholder for Health Platform integration) */}
      <footer className="fixed bottom-0 w-full bg-white border-t px-6 py-3 flex justify-around items-center text-slate-400 text-xs md:hidden">
        <div className="flex flex-col items-center gap-1 text-emerald-600">
          <Search className="w-5 h-5" />
          <span>Find</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Pill className="w-5 h-5" />
          <span>Meds</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <AlertCircle className="w-5 h-5" />
          <span>Urgent</span>
        </div>
      </footer>
    </div>
  );
};

export default App;