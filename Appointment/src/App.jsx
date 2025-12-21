import React, { useState, useEffect } from "react";
import {
  User,
  UserPlus,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  MapPin,
  Star,
} from "lucide-react";

// --- Mock Data ---
const INITIAL_DOCTORS = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    specialty: "Cardiologist",
    experience: "12 years",
    rating: 4.9,
    fee: 150,
    about: "Specializing in preventive cardiology and heart health management.",
    availability: ["Monday", "Wednesday", "Friday"],
  },
  {
    id: 2,
    name: "Dr. James Wilson",
    specialty: "Dermatologist",
    experience: "8 years",
    rating: 4.7,
    fee: 120,
    about: "Expert in clinical dermatology and skin cancer screening.",
    availability: ["Tuesday", "Thursday", "Saturday"],
  },
];

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

export default function App() {
  const [view, setView] = useState("patient"); // 'admin' or 'patient'
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState([]);
  const [bookingStep, setBookingStep] = useState(0); // 0: Browse, 1: Date, 2: Time, 3: Payment, 4: Success
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    time: "",
    patientName: "",
  });

  // --- Admin Logic ---
  const addDoctor = (newDoc) => {
    setDoctors([...doctors, { ...newDoc, id: Date.now(), rating: 5.0 }]);
  };

  // --- Booking Flow Logic ---
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingStep(1);
  };

  const nextStep = () => setBookingStep((prev) => prev + 1);
  const prevStep = () => setBookingStep((prev) => prev - 1);

  const confirmBooking = () => {
    const newAppointment = {
      id: Date.now(),
      doctor: selectedDoctor,
      ...bookingDetails,
      status: "Confirmed",
    };
    setAppointments([...appointments, newAppointment]);
    setBookingStep(4);
  };

  const resetBooking = () => {
    setBookingStep(0);
    setSelectedDoctor(null);
    setBookingDetails({ date: "", time: "", patientName: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-blue-600 text-xl">
            <Stethoscope size={28} />
            <span>HealthSync</span>
          </div>

          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => {
                setView("patient");
                resetBooking();
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === "patient"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500"
              }`}
            >
              Patient Portal
            </button>
            <button
              onClick={() => {
                setView("admin");
                resetBooking();
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === "admin"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500"
              }`}
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {view === "admin" ? (
          <AdminDashboard
            doctors={doctors}
            onAddDoctor={addDoctor}
            appointments={appointments}
          />
        ) : (
          <PatientBooking
            doctors={doctors}
            step={bookingStep}
            selectedDoctor={selectedDoctor}
            bookingDetails={bookingDetails}
            setBookingDetails={setBookingDetails}
            onSelectDoctor={handleSelectDoctor}
            onNext={nextStep}
            onPrev={prevStep}
            onConfirm={confirmBooking}
            onReset={resetBooking}
          />
        )}
      </main>
    </div>
  );
}

// --- Admin Components ---
function AdminDashboard({ doctors, onAddDoctor, appointments }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    experience: "",
    fee: "",
    about: "",
    availability: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddDoctor({
      ...formData,
      availability: formData.availability.split(",").map((s) => s.trim()),
    });
    setFormData({
      name: "",
      specialty: "",
      experience: "",
      fee: "",
      about: "",
      availability: "",
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <p className="text-slate-500">
            Manage doctors and monitor appointments
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Add New Doctor
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">
            Total Doctors
          </div>
          <div className="text-3xl font-bold">{doctors.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">
            Total Appointments
          </div>
          <div className="text-3xl font-bold">{appointments.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">
            Today's Revenue
          </div>
          <div className="text-3xl font-bold text-green-600">
            $
            {appointments.reduce(
              (acc, curr) => acc + Number(curr.doctor.fee),
              0
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold">
          Doctor Directory
        </div>
        <table className="w-full text-left">
          <thead className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Doctor Name</th>
              <th className="px-6 py-3">Specialty</th>
              <th className="px-6 py-3">Fee</th>
              <th className="px-6 py-3">Availability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {doctors.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{doc.name}</td>
                <td className="px-6 py-4">{doc.specialty}</td>
                <td className="px-6 py-4">${doc.fee}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {doc.availability.join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Add New Doctor</h2>
              <div className="space-y-3">
                <input
                  required
                  placeholder="Name (e.g. Dr. John Doe)"
                  className="w-full p-2 border rounded-lg"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  required
                  placeholder="Specialty"
                  className="w-full p-2 border rounded-lg"
                  value={formData.specialty}
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Exp (e.g. 10 years)"
                    className="p-2 border rounded-lg"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                  />
                  <input
                    required
                    type="number"
                    placeholder="Consultation Fee ($)"
                    className="p-2 border rounded-lg"
                    value={formData.fee}
                    onChange={(e) =>
                      setFormData({ ...formData, fee: e.target.value })
                    }
                  />
                </div>
                <input
                  required
                  placeholder="Availability (Comma separated days)"
                  className="w-full p-2 border rounded-lg"
                  value={formData.availability}
                  onChange={(e) =>
                    setFormData({ ...formData, availability: e.target.value })
                  }
                />
                <textarea
                  placeholder="Brief Bio"
                  className="w-full p-2 border rounded-lg h-24"
                  value={formData.about}
                  onChange={(e) =>
                    setFormData({ ...formData, about: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Patient Flow Components ---
function PatientBooking({
  doctors,
  step,
  selectedDoctor,
  bookingDetails,
  setBookingDetails,
  onSelectDoctor,
  onNext,
  onPrev,
  onConfirm,
  onReset,
}) {
  // Progress Bar
  const renderProgress = () => {
    if (step === 0 || step === 4) return null;
    return (
      <div className="flex items-center justify-between max-w-lg mx-auto mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center relative flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${
                step >= s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {step > s ? <CheckCircle size={16} /> : s}
            </div>
            <div className="text-[10px] uppercase font-bold mt-2 tracking-wider text-slate-400">
              {s === 1 ? "Schedule" : s === 2 ? "Details" : "Payment"}
            </div>
            {s < 3 && (
              <div
                className={`absolute left-[50%] top-4 w-full h-[2px] -z-0 ${
                  step > s ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderProgress()}

      {step === 0 && (
        <div className="space-y-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Book Your Next Checkup
            </h1>
            <p className="text-slate-500 mt-2">
              Choose from our top-rated specialists available today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                      <User size={32} />
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">
                      <Star size={12} fill="currentColor" /> {doc.rating}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                    {doc.name}
                  </h3>
                  <p className="text-blue-600 font-semibold text-sm mb-2">
                    {doc.specialty}
                  </p>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                    {doc.about}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {doc.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> Medical Center
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Consultation Fee
                      </p>
                      <p className="text-lg font-bold">${doc.fee}</p>
                    </div>
                    <button
                      onClick={() => onSelectDoctor(doc)}
                      className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      Book Now <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in zoom-in-95">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="text-blue-600" /> Select Date & Time
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Consultation Date
              </label>
              <input
                type="date"
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) =>
                  setBookingDetails({ ...bookingDetails, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Available Time Slots
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() =>
                      setBookingDetails({ ...bookingDetails, time: slot })
                    }
                    className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                      bookingDetails.time === slot
                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                        : "border-slate-200 hover:border-blue-400 text-slate-600"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                onClick={onPrev}
                className="flex-1 py-4 border rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                disabled={!bookingDetails.date || !bookingDetails.time}
                onClick={onNext}
                className="flex-2 flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in zoom-in-95">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <UserPlus className="text-blue-600" /> Patient Information
          </h2>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 shadow-sm">
                <Stethoscope size={24} />
              </div>
              <div>
                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">
                  Booking with
                </p>
                <p className="font-bold text-blue-900">
                  {selectedDoctor?.name}
                </p>
                <p className="text-sm text-blue-700">
                  {bookingDetails.date} at {bookingDetails.time}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Patient Full Name
              </label>
              <input
                type="text"
                placeholder="Enter patient's name"
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={bookingDetails.patientName}
                onChange={(e) =>
                  setBookingDetails({
                    ...bookingDetails,
                    patientName: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                onClick={onPrev}
                className="flex-1 py-4 border rounded-xl font-bold hover:bg-slate-50"
              >
                Back
              </button>
              <button
                disabled={!bookingDetails.patientName}
                onClick={onNext}
                className="flex-2 flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in zoom-in-95">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="text-blue-600" /> Payment Confirmation
          </h2>
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Consultation Fee</span>
                <span className="font-bold">${selectedDoctor?.fee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Service Fee</span>
                <span className="font-bold">$5.00</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="font-bold">Total Amount</span>
                <span className="text-xl font-extrabold text-blue-600">
                  ${Number(selectedDoctor?.fee) + 5}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700">
                Card Details
              </label>
              <div className="p-4 border border-slate-200 rounded-xl flex items-center gap-3 text-slate-400 italic">
                <CreditCard size={20} />
                <span>•••• •••• •••• 4242 (Simulated)</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
                Secure SSL Encrypted Payment
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={onPrev}
                className="flex-1 py-4 border rounded-xl font-bold hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={onConfirm}
                className="flex-2 flex-[2] py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-100"
              >
                Complete Payment & Book
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="max-w-md mx-auto text-center py-12 px-6 animate-in zoom-in-90 duration-300">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-extrabold mb-4">
            Appointment Confirmed!
          </h2>
          <p className="text-slate-500 mb-8">
            Your appointment with{" "}
            <span className="font-bold text-slate-900">
              {selectedDoctor?.name}
            </span>{" "}
            has been successfully scheduled for{" "}
            <span className="font-bold text-slate-900">
              {bookingDetails.date}
            </span>{" "}
            at{" "}
            <span className="font-bold text-slate-900">
              {bookingDetails.time}
            </span>
            .
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Booking ID:</span>
              <span className="font-mono font-bold">
                #HS-{Math.floor(Math.random() * 90000 + 10000)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold">{bookingDetails.patientName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status:</span>
              <span className="text-green-600 font-bold uppercase tracking-tighter">
                Paid
              </span>
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      )}
    </div>
  );
}
