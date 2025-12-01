import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../../services/firebase";
import Sidebar from "../../components/Sidebar/Sidebar";

const AddAdmin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [fetchingAdmins, setFetchingAdmins] = useState(true);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError("Nama tidak boleh kosong");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        createdAt: new Date(),
      });

      setSuccess(`Admin ${name} berhasil ditambahkan!`);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("admin");

      fetchAdmins();
    } catch (err) {
      console.error("Error detail:", err);
      if (err.code === "auth/email-already-in-use") setError("Email sudah terdaftar");
      else if (err.code === "auth/invalid-email") setError("Email tidak valid");
      else if (err.code === "auth/weak-password") setError("Password terlalu lemah");
      else setError(err.message || "Gagal menambahkan admin");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setFetchingAdmins(true);
      const q = query(collection(db, "users"), where("role", "==", "admin"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAdmins(list);
    } catch (err) {
      console.error("Fetch admins error:", err);
      setError("Gagal memuat daftar admin");
    } finally {
      setFetchingAdmins(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDeleteAdmin = async (id) => {
    if (auth?.currentUser?.uid === id) {
      setError("Tidak dapat menghapus akun yang sedang login");
      return;
    }
    if (!window.confirm("Hapus admin ini dari Firestore?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setAdmins((a) => a.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete admin error:", err);
      setError("Gagal menghapus admin");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Tambah Admin</h1>
          <p className="text-sm text-gray-500">Buat akun admin baru & kelola daftar admin</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* FormTambahAdmin */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">

            {/* Alert */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-lg text-green-700">
                {success}
              </div>
            )}

            <h2 className="text-lg font-semibold mb-4 text-gray-800">Form Tambah Admin</h2>

            <form onSubmit={handleAddAdmin} className="space-y-4">

              <div>
                <label className="block text-gray-700 font-medium mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Nama admin"
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-600 focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-600 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-600 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Konfirmasi Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-600 focus:outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Menambahkan..." : "Tambah Admin"}
              </button>

            </form>
          </div>

          {/* Daftar Admin */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Daftar Admin</h2>

            {fetchingAdmins ? (
              <p>Memuat daftar admin...</p>
            ) : admins.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada admin yang terdaftar.</p>
            ) : (
              <div className="space-y-4">
                {admins.map((a) => {
                  const isCurrentUser = auth?.currentUser?.uid === a.id;
                  return (
                    <div
                      key={a.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-gray-800">{a.name || a.email}</div>
                        <div className="text-sm text-gray-600">{a.email}</div>
                        <div className="text-xs text-gray-400">
                          Dibuat: {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : ""}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteAdmin(a.id)}
                        disabled={isCurrentUser}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          isCurrentUser
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        {isCurrentUser ? "Sedang Login" : "Hapus"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              Catatan: Penghapusan hanya menghapus data dari Firestore, bukan akun Authentication.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AddAdmin;
