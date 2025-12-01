import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import useAuth from "../../hooks/useAuth";
import { FiCalendar, FiClock, FiMapPin, FiFileText, FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";

const RiwayatPeminjaman = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, approved, rejected
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.uid) {
      fetchBookings();
    }
  }, [user, filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      
      let q;
      let querySnapshot;

      try {
        // Try with orderBy first (requires index)
        if (filterStatus === "all") {
          q = query(
            collection(db, "bookings"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
        } else {
          q = query(
            collection(db, "bookings"),
            where("userId", "==", user.uid),
            where("status", "==", filterStatus),
            orderBy("createdAt", "desc")
          );
        }
        querySnapshot = await getDocs(q);
      } catch (orderByError) {
        // If orderBy fails (index not created), try without orderBy
        console.warn("OrderBy failed, trying without orderBy:", orderByError);
        
        if (filterStatus === "all") {
          q = query(
            collection(db, "bookings"),
            where("userId", "==", user.uid)
          );
        } else {
          q = query(
            collection(db, "bookings"),
            where("userId", "==", user.uid),
            where("status", "==", filterStatus)
          );
        }
        querySnapshot = await getDocs(q);
      }

      const bookingsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort manually if orderBy failed
      if (bookingsList.length > 0 && bookingsList[0].createdAt) {
        bookingsList.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA; // Descending order
        });
      }

      console.log("Fetched bookings:", bookingsList.length);
      setBookings(bookingsList);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(`Gagal memuat riwayat peminjaman: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1">
            <FiCheckCircle className="w-4 h-4" />
            Disetujui
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold flex items-center gap-1">
            <FiXCircle className="w-4 h-4" />
            Ditolak
          </span>
        );
      case "pending":
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold flex items-center gap-1">
            <FiAlertCircle className="w-4 h-4" />
            Menunggu Persetujuan
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.substring(0, 5); // Format HH:MM
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    try {
      let date;
      if (timestamp.toDate) {
        // Firestore Timestamp
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (timestamp.seconds) {
        // Timestamp object with seconds
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      return date.toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error("Error formatting date:", err, timestamp);
      return "-";
    }
  };

  // Count bookings by status
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved").length;
  const rejectedCount = bookings.filter((b) => b.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-blue-600">
                Peminjaman Ruangan
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/home")}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate("/riwayat")}
                  className="text-blue-600 font-semibold border-b-2 border-blue-600"
                >
                  Riwayat
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user?.email || "User"}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Riwayat Peminjaman
          </h2>
          <p className="text-gray-600">
            Lihat semua riwayat permintaan peminjaman ruangan Anda
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            onClick={() => setFilterStatus("all")}
            className={`bg-white p-4 rounded-xl shadow cursor-pointer transition ${
              filterStatus === "all"
                ? "border-2 border-blue-600"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold text-gray-800">
              {bookings.length}
            </div>
          </div>
          <div
            onClick={() => setFilterStatus("pending")}
            className={`bg-white p-4 rounded-xl shadow cursor-pointer transition ${
              filterStatus === "pending"
                ? "border-2 border-yellow-600"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="text-sm text-gray-500">Menunggu</div>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
          </div>
          <div
            onClick={() => setFilterStatus("approved")}
            className={`bg-white p-4 rounded-xl shadow cursor-pointer transition ${
              filterStatus === "approved"
                ? "border-2 border-green-600"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="text-sm text-gray-500">Disetujui</div>
            <div className="text-2xl font-bold text-green-600">
              {approvedCount}
            </div>
          </div>
          <div
            onClick={() => setFilterStatus("rejected")}
            className={`bg-white p-4 rounded-xl shadow cursor-pointer transition ${
              filterStatus === "rejected"
                ? "border-2 border-red-600"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="text-sm text-gray-500">Ditolak</div>
            <div className="text-2xl font-bold text-red-600">
              {rejectedCount}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Memuat riwayat peminjaman...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Belum ada riwayat peminjaman
            </p>
            <p className="text-gray-500 mb-6">
              {filterStatus === "all"
                ? "Anda belum pernah melakukan peminjaman ruangan"
                : `Tidak ada peminjaman dengan status "${filterStatus}"`}
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Pinjam Ruangan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left Section - Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {booking.roomName}
                        </h3>
                        {booking.roomLocation && (
                          <p className="text-gray-600 flex items-center gap-2">
                            <FiMapPin className="w-4 h-4" />
                            {booking.roomLocation}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Tanggal & Waktu */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FiCalendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Tanggal:</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          {formatDate(booking.startDate)} -{" "}
                          {formatDate(booking.endDate)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <FiClock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Waktu:</span>
                        <span className="text-sm text-gray-600">
                          {formatTime(booking.startTime)} -{" "}
                          {formatTime(booking.endTime)}
                        </span>
                      </div>
                    </div>

                    {/* Tujuan Peminjaman */}
                    {booking.purpose && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-1">
                          <FiFileText className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Tujuan:</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          {booking.purpose}
                        </p>
                      </div>
                    )}

                    {/* Created At */}
                    <div className="text-xs text-gray-500">
                      Diajukan pada: {formatDateTime(booking.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RiwayatPeminjaman;

