import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import Sidebar from "../../components/Sidebar/Sidebar";
import useAuth from "../../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  const [adminName, setAdminName] = useState("");
  const [, setRooms] = useState([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch admin name
        if (user && user.uid) {
          const adminDoc = await getDocs(collection(db, "users"));
          const adminData = adminDoc.docs.find((d) => d.id === user.uid);
          if (adminData) {
            setAdminName(adminData.data().name || user.email || "Admin");
          }
        }

        // Fetch rooms
        const roomsSnapshot = await getDocs(collection(db, "rooms"));
        const roomsList = roomsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(roomsList);
        setTotalRooms(roomsList.length);

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"));
        setTotalUsers(usersSnapshot.docs.length);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data dari Firestore");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-3xl font-bold">
            Selamat Datang, {adminName || "Admin"}!
          </h2>
          <p className="text-blue-100 mt-2">
            Kelola semua ruangan dan data administrasi dari dashboard ini
          </p>
        </div>

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard CMS</h1>
          <p className="text-sm text-gray-500">
            Ringkasan administrasi dan pengelolaan ruangan
          </p>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          {/* Total Ruangan */}
          <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4 border-l-4 border-blue-600">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.75 17L9 21l3-1 3 1-.75-4m4.5-11h-15a1.5 1.5 0 00-1.5 1.5V18A1.5 1.5 0 006 19.5h12A1.5 1.5 0 0019.5 18V7.5A1.5 1.5 0 0018 6z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Ruangan</div>
              <div className="text-3xl font-bold text-gray-800">{totalRooms}</div>
            </div>
          </div>

          {/* Peminjaman Aktif */}
          <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4 border-l-4 border-green-600">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Peminjaman Aktif</div>
              <div className="text-3xl font-bold text-gray-800">-</div>
            </div>
          </div>

          {/* Total Pengguna */}
          <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4 border-l-4 border-purple-600">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6H2v-2a4 4 0 014-4h1m6-2a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Pengguna</div>
              <div className="text-3xl font-bold text-gray-800">{totalUsers}</div>
            </div>
          </div>

        </section>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4 rounded text-red-700">
            {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
