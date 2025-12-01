import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, addDoc, doc, getDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import { FiUser, FiMail, FiPhone, FiCalendar, FiClock, FiFileText } from "react-icons/fi";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const room = location.state?.room;

  // Time slots configuration
  const timeSlots = [
    { id: "pagi", label: "Pagi", start: "07:00", end: "10:00" },
    { id: "siang", label: "Siang", start: "12:00", end: "15:00" },
    { id: "malam", label: "Malam", start: "17:00", end: "19:00" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bookingDate: "",
    timeSlot: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setFormData((prev) => ({
              ...prev,
              name: data.name || user.displayName || "",
              email: data.email || user.email || "",
            }));
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Function to check if slot is already booked
  const checkSlotAvailability = async (roomId, bookingDate, timeSlot) => {
    try {
      // Query bookings with same room, date, time slot, and approved status
      const q = query(
        collection(db, "bookings"),
        where("roomId", "==", roomId),
        where("bookingDate", "==", bookingDate),
        where("timeSlot", "==", timeSlot),
        where("status", "==", "approved")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.empty; // Returns true if no booking found (available)
    } catch (err) {
      console.error("Error checking slot availability:", err);
      // If query fails, assume available to not block user
      return true;
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-gray-600 mb-4">Ruangan tidak ditemukan</p>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    // If time slot is selected, auto-fill start and end time
    if (name === "timeSlot" && value) {
      const selectedSlot = timeSlots.find((slot) => slot.id === value);
      if (selectedSlot) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error when user changes input
    setError("");
    
    // Check availability in real-time if both date and slot are selected
    if ((name === "bookingDate" || name === "timeSlot") && room?.id) {
      const currentDate = name === "bookingDate" ? value : formData.bookingDate;
      const currentSlot = name === "timeSlot" ? value : formData.timeSlot;
      
      if (currentDate && currentSlot) {
        setCheckingAvailability(true);
        try {
          const isAvailable = await checkSlotAvailability(
            room.id,
            currentDate,
            currentSlot
          );
          
          if (!isAvailable) {
            const selectedSlot = timeSlots.find((slot) => slot.id === currentSlot);
            setError(
              `Slot ${selectedSlot?.label} (${selectedSlot?.start} - ${selectedSlot?.end}) pada tanggal ${new Date(currentDate).toLocaleDateString("id-ID")} sudah dibooking. Silakan pilih tanggal atau slot waktu lain.`
            );
          }
        } catch (err) {
          console.error("Error checking availability:", err);
        } finally {
          setCheckingAvailability(false);
        }
      }
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nama lengkap harus diisi");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email harus diisi");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Nomor telepon harus diisi");
      return false;
    }
    if (!formData.bookingDate) {
      setError("Tanggal peminjaman harus diisi");
      return false;
    }
    if (!formData.timeSlot) {
      setError("Slot waktu harus dipilih");
      return false;
    }

    // Validate that time slot is selected
    const selectedSlot = timeSlots.find((slot) => slot.id === formData.timeSlot);
    if (!selectedSlot) {
      setError("Slot waktu tidak valid");
      return false;
    }

    // Validate date
    const bookingDateTime = new Date(`${formData.bookingDate}T${selectedSlot.start}`);
    const now = new Date();

    if (bookingDateTime < now) {
      setError("Tanggal dan waktu peminjaman tidak boleh di masa lalu");
      return false;
    }

    if (!formData.purpose.trim()) {
      setError("Tujuan peminjaman harus diisi");
      return false;
    }

    return true;
  };

  // Validate slot availability
  const validateSlotAvailability = async () => {
    if (!room?.id || !formData.bookingDate || !formData.timeSlot) {
      return true; // Skip validation if required fields not filled
    }

    setCheckingAvailability(true);
    try {
      const isAvailable = await checkSlotAvailability(
        room.id,
        formData.bookingDate,
        formData.timeSlot
      );

      if (!isAvailable) {
        const selectedSlot = timeSlots.find((slot) => slot.id === formData.timeSlot);
        setError(
          `Ruangan ${room.name} pada tanggal ${new Date(formData.bookingDate).toLocaleDateString("id-ID")} untuk slot ${selectedSlot?.label} (${selectedSlot?.start} - ${selectedSlot?.end}) sudah dibooking. Silakan pilih tanggal atau slot waktu lain.`
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error validating availability:", err);
      return true; // Allow submission if check fails
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    // Check slot availability before submitting
    const isAvailable = await validateSlotAvailability();
    if (!isAvailable) {
      return;
    }

    setSubmitting(true);

    try {
      const selectedSlot = timeSlots.find((slot) => slot.id === formData.timeSlot);
      const startDateTime = new Date(`${formData.bookingDate}T${selectedSlot.start}`);
      const endDateTime = new Date(`${formData.bookingDate}T${selectedSlot.end}`);

      const bookingData = {
        roomId: room.id,
        roomName: room.name,
        roomLocation: room.location || "",
        userId: user.uid,
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        bookingDate: formData.bookingDate,
        startDate: formData.bookingDate,
        endDate: formData.bookingDate,
        timeSlot: formData.timeSlot,
        timeSlotLabel: selectedSlot.label,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        startDateTime: Timestamp.fromDate(startDateTime),
        endDateTime: Timestamp.fromDate(endDateTime),
        purpose: formData.purpose,
        status: "pending", // pending, approved, rejected
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "bookings"), bookingData);
      console.log("Booking created with ID:", docRef.id);

      const result = await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Permintaan peminjaman ruangan telah dikirim. Menunggu persetujuan admin.",
        confirmButtonColor: "#2563eb",
        showCancelButton: true,
        confirmButtonText: "Lihat Riwayat",
        cancelButtonText: "Kembali ke Home",
      });

      if (result.isConfirmed) {
        navigate("/riwayat");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Error submitting booking:", err);
      setError("Gagal mengirim permintaan peminjaman. Silakan coba lagi.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengirim permintaan peminjaman. Silakan coba lagi.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke Home
        </button>

        {/* Room Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-100">
            {room.location && (
              <p className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                Lokasi: {room.location}
              </p>
            )}
            <p className="flex items-center gap-2">
              <FiUser className="w-4 h-4" />
              Kapasitas: {room.capacity} orang
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Form Peminjaman Ruangan
          </h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identitas Section */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Identitas Peminjam
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Nama lengkap"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Nomor Telepon */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="081234567890"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Waktu Peminjaman Section */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                Waktu Peminjaman
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tanggal Peminjaman */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Tanggal Peminjaman <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="date"
                      name="bookingDate"
                      value={formData.bookingDate}
                      onChange={handleChange}
                      min={today}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Slot Waktu */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Slot Waktu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-3.5 text-gray-400 z-10" />
                    <select
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 appearance-none bg-white"
                      required
                    >
                      <option value="">Pilih Slot Waktu</option>
                      {timeSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.label} ({slot.start} - {slot.end})
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                   {checkingAvailability && (
                     <p className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                       <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Mengecek ketersediaan...
                     </p>
                   )}
                   {formData.timeSlot && !checkingAvailability && (
                     <p className="mt-2 text-sm text-gray-600">
                       Waktu: {timeSlots.find((s) => s.id === formData.timeSlot)?.start} - {timeSlots.find((s) => s.id === formData.timeSlot)?.end}
                     </p>
                   )}
                </div>
              </div>
            </div>

            {/* Tujuan Peminjaman */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                <FiFileText className="w-5 h-5" />
                Tujuan Peminjaman <span className="text-red-500">*</span>
              </label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Jelaskan tujuan peminjaman ruangan ini..."
                required
              />
            </div>

            {/* Status Info */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Status:</strong> Permintaan Anda akan berstatus{" "}
                <span className="font-semibold">"Pending"</span> dan menunggu
                persetujuan dari admin.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Batal
              </button>
               <button
                 type="submit"
                 disabled={submitting || checkingAvailability}
                 className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition ${
                   submitting || checkingAvailability ? "opacity-70 cursor-not-allowed" : ""
                 }`}
               >
                 {checkingAvailability
                   ? "Mengecek ketersediaan..."
                   : submitting
                   ? "Mengirim..."
                   : "Kirim Permintaan Peminjaman"}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;

