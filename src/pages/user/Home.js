import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import useAuth from "../../hooks/useAuth";
import RoomCard from "../../components/RoomCard/RoomCard";

const Home = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const roomsSnapshot = await getDocs(collection(db, "rooms"));
        const roomsList = roomsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(roomsList);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Gagal memuat daftar ruangan");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleBookRoom = (room) => {
    // Navigate to booking page with room data
    navigate("/booking", { state: { room } });
  };

  // Filter rooms based on search term
  const filteredRooms = rooms.filter((room) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.name?.toLowerCase().includes(searchLower) ||
      room.location?.toLowerCase().includes(searchLower) ||
      room.facilities?.some((facility) =>
        facility.toLowerCase().includes(searchLower)
      )
    );
  });

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
                  className="text-blue-600 font-semibold border-b-2 border-blue-600"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate("/riwayat")}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Riwayat
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                {user?.email || "User"}
              </span>
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
            Ruangan Tersedia
          </h2>
          <p className="text-gray-600">
            Pilih ruangan yang ingin Anda pinjam
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari ruangan, lokasi, atau fasilitas..."
              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-4 top-3.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
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
              <p className="text-gray-600">Memuat ruangan...</p>
            </div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20">
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
                d="M9.75 17L9 21l3-1 3 1-.75-4m4.5-11h-15a1.5 1.5 0 00-1.5 1.5V18A1.5 1.5 0 006 19.5h12A1.5 1.5 0 0019.5 18V7.5A1.5 1.5 0 0018 6z"
              />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm
                ? "Tidak ada ruangan yang sesuai dengan pencarian"
                : "Belum ada ruangan tersedia"}
            </p>
            <p className="text-gray-500">
              {searchTerm
                ? "Coba cari dengan kata kunci lain"
                : "Admin belum menambahkan ruangan"}
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              Menampilkan {filteredRooms.length} dari {rooms.length} ruangan
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onBook={handleBookRoom}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
