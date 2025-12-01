import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy, where, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import Sidebar from "../../components/Sidebar/Sidebar";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import { FiCalendar, FiClock, FiMapPin, FiFileText, FiCheckCircle, FiXCircle, FiAlertCircle, FiUser, FiMail, FiPhone, FiSearch } from "react-icons/fi";

const MonitoringPeminjaman = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      let q;
      let querySnapshot;

      try {
        // Try with orderBy first
        if (filterStatus === "all") {
          q = query(
            collection(db, "bookings"),
            orderBy("createdAt", "desc")
          );
        } else {
          q = query(
            collection(db, "bookings"),
            where("status", "==", filterStatus),
            orderBy("createdAt", "desc")
          );
        }
        querySnapshot = await getDocs(q);
      } catch (orderByError) {
        // Fallback without orderBy
        console.warn("OrderBy failed, trying without orderBy:", orderByError);
        if (filterStatus === "all") {
          q = query(collection(db, "bookings"));
        } else {
          q = query(
            collection(db, "bookings"),
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
          return dateB - dateA;
        });
      }

      setBookings(bookingsList);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(`Gagal memuat data peminjaman: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    const result = await Swal.fire({
      title: "Setujui Peminjaman?",
      text: "Peminjaman ini akan disetujui dan status akan berubah menjadi 'Disetujui'",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Setujui",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: "approved",
        updatedAt: Timestamp.now(),
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Peminjaman telah disetujui",
        confirmButtonColor: "#10b981",
      });

      fetchBookings();
    } catch (err) {
      console.error("Error approving booking:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menyetujui peminjaman",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleReject = async (bookingId) => {
    const result = await Swal.fire({
      title: "Tolak Peminjaman?",
      text: "Peminjaman ini akan ditolak dan status akan berubah menjadi 'Ditolak'",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Tolak",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: "rejected",
        updatedAt: Timestamp.now(),
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Peminjaman telah ditolak",
        confirmButtonColor: "#ef4444",
      });

      fetchBookings();
    } catch (err) {
      console.error("Error rejecting booking:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menolak peminjaman",
        confirmButtonColor: "#ef4444",
      });
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
    return timeString.substring(0, 5);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (timestamp.seconds) {
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
      console.error("Error formatting date:", err);
      return "-";
    }
  };

  // Filter bookings by search term
  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.roomName?.toLowerCase().includes(searchLower) ||
      booking.userName?.toLowerCase().includes(searchLower) ||
      booking.userEmail?.toLowerCase().includes(searchLower) ||
      booking.roomLocation?.toLowerCase().includes(searchLower)
    );
  });

  // Count bookings by status
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved").length;
  const rejectedCount = bookings.filter((b) => b.status === "rejected").length;
  const totalCount = bookings.length;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Monitoring Peminjaman
          </h1>
          <p className="text-sm text-gray-500">
            Kelola dan pantau semua permintaan peminjaman ruangan
          </p>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div
            onClick={() => setFilterStatus("all")}
            className={`bg-white p-5 rounded-xl shadow cursor-pointer transition ${
              filterStatus === "all"
                ? "border-2 border-blue-600"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="text-sm text-gray-500">Total Peminjaman</div>
            <div className="text-3xl font-bold text-gray-800">{totalCount}</div>
          </div>

          <div
            onClick={() => setFilterStatus("pending")}
            className={`bg-white p-5 rounded-xl shadow cursor-pointer transition ${
              filterStatus === "pending"
                ? "border-2 border-yellow-600"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="text-sm text-gray-500">Menunggu Persetujuan</div>
            <div className="text-3xl font-bold text-yellow-600">
              {pendingCount}
            </div>
          </div>

          <div
            onClick={() => setFilterStatus("approved")}
            className={`bg-white p-5 rounded-xl shadow cursor-pointer transition ${
              filterStatus === "approved"
                ? "border-2 border-green-600"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="text-sm text-gray-500">Disetujui</div>
            <div className="text-3xl font-bold text-green-600">
              {approvedCount}
            </div>
          </div>

          <div
            onClick={() => setFilterStatus("rejected")}
            className={`bg-white p-5 rounded-xl shadow cursor-pointer transition ${
              filterStatus === "rejected"
                ? "border-2 border-red-600"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="text-sm text-gray-500">Ditolak</div>
            <div className="text-3xl font-bold text-red-600">
              {rejectedCount}
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama ruangan, nama peminjam, atau email..."
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              <p className="text-gray-600">Memuat data peminjaman...</p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
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
              Tidak ada data peminjaman
            </p>
            <p className="text-gray-500">
              {searchTerm
                ? "Tidak ada peminjaman yang sesuai dengan pencarian"
                : filterStatus === "all"
                ? "Belum ada permintaan peminjaman"
                : `Tidak ada peminjaman dengan status "${filterStatus}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
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

                    {/* User Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 text-gray-700 mb-1">
                          <FiUser className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Peminjam:</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          {booking.userName}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-gray-700 mb-1">
                          <FiMail className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Email:</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          {booking.userEmail}
                        </p>
                      </div>
                      {booking.userPhone && (
                        <div>
                          <div className="flex items-center gap-2 text-gray-700 mb-1">
                            <FiPhone className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Telepon:</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-6">
                            {booking.userPhone}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiCalendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Tanggal:</span>
                        <span className="text-sm text-gray-600">
                          {formatDate(booking.startDate)} -{" "}
                          {formatDate(booking.endDate)}
                        </span>
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

                    {/* Purpose */}
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

                  {/* Right Section - Action Buttons */}
                  {booking.status === "pending" && (
                    <div className="flex flex-col gap-2 lg:min-w-[200px]">
                      <button
                        onClick={() => handleApprove(booking.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <FiCheckCircle className="w-5 h-5" />
                        Setujui
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <FiXCircle className="w-5 h-5" />
                        Tolak
                      </button>
                    </div>
                  )}

                  {booking.status !== "pending" && (
                    <div className="lg:min-w-[200px] flex items-center justify-center">
                      <p className="text-sm text-gray-500 italic">
                        {booking.status === "approved"
                          ? "Peminjaman telah disetujui"
                          : "Peminjaman telah ditolak"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MonitoringPeminjaman;

