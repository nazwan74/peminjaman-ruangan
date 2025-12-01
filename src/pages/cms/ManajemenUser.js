import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import Sidebar from "../../components/Sidebar/Sidebar";
import Swal from "sweetalert2";
import { FiUser, FiMail, FiEdit2, FiTrash2, FiSearch, FiShield, FiUserCheck } from "react-icons/fi";

const ManajemenUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all"); // all, admin, user
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      let q;
      if (filterRole === "all") {
        q = query(collection(db, "users"));
      } else {
        q = query(collection(db, "users"), where("role", "==", filterRole));
      }

      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(`Gagal memuat daftar user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: "", email: "", role: "" });
  };

  const handleUpdateUser = async (userId) => {
    if (!editForm.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Nama tidak boleh kosong",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    if (!editForm.email.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Email tidak boleh kosong",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        updatedAt: Timestamp.now(),
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data user berhasil diperbarui",
        confirmButtonColor: "#10b981",
      });

      setEditingUser(null);
      setEditForm({ name: "", email: "", role: "" });
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memperbarui data user",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    // Prevent deleting current user
    if (auth?.currentUser?.uid === userId) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Bisa",
        text: "Anda tidak dapat menghapus akun yang sedang login",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Hapus User?",
      html: `Apakah Anda yakin ingin menghapus user <strong>${userName}</strong>?<br/><br/>Tindakan ini hanya menghapus data dari Firestore, bukan akun Authentication.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      await Swal.fire({
        icon: "success",
        title: "Terhapus!",
        text: "User berhasil dihapus",
        confirmButtonColor: "#10b981",
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menghapus user",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  // Count users by role
  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;
  const totalCount = users.length;

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "-";
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Manajemen User
          </h1>
          <p className="text-sm text-gray-500">
            Kelola daftar user dan admin sistem
          </p>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div
            onClick={() => setFilterRole("all")}
            className={`bg-white p-5 rounded-xl shadow cursor-pointer transition ${
              filterRole === "all"
                ? "border-2 border-blue-600"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="text-sm text-gray-500">Total User</div>
            <div className="text-3xl font-bold text-gray-800">{totalCount}</div>
          </div>

          <div
            onClick={() => setFilterRole("admin")}
            className={`bg-white p-5 rounded-xl shadow cursor-pointer transition ${
              filterRole === "admin"
                ? "border-2 border-purple-600"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="text-sm text-gray-500">Admin</div>
            <div className="text-3xl font-bold text-purple-600">
              {adminCount}
            </div>
          </div>

          <div
            onClick={() => setFilterRole("user")}
            className={`bg-white p-5 rounded-xl shadow cursor-pointer transition ${
              filterRole === "user"
                ? "border-2 border-green-600"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="text-sm text-gray-500">User</div>
            <div className="text-3xl font-bold text-green-600">{userCount}</div>
          </div>
        </section>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau email..."
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
              <p className="text-gray-600">Memuat daftar user...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
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
                d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6H2v-2a4 4 0 014-4h1m6-2a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Tidak ada user
            </p>
            <p className="text-gray-500">
              {searchTerm
                ? "Tidak ada user yang sesuai dengan pencarian"
                : `Tidak ada user dengan role "${filterRole}"`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibuat
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const isCurrentUser = auth?.currentUser?.uid === user.id;
                    const isEditing = editingUser === user.id;

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        {isEditing ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, name: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="Nama"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, email: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="Email"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={editForm.role}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, role: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateUser(user.id)}
                                  className="text-green-600 hover:text-green-900 font-medium"
                                >
                                  Simpan
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-gray-600 hover:text-gray-900 font-medium"
                                >
                                  Batal
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FiUser className="w-5 h-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name || "Tidak ada nama"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {user.role === "admin" ? (
                                  <span className="flex items-center gap-1">
                                    <FiShield className="w-3 h-3" />
                                    Admin
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <FiUserCheck className="w-3 h-3" />
                                    User
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition"
                                  title="Edit"
                                >
                                  <FiEdit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                                  disabled={isCurrentUser}
                                  className={`p-2 rounded-lg transition ${
                                    isCurrentUser
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-red-600 hover:text-red-900 hover:bg-red-50"
                                  }`}
                                  title={isCurrentUser ? "Tidak bisa menghapus akun sendiri" : "Hapus"}
                                >
                                  <FiTrash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManajemenUser;

