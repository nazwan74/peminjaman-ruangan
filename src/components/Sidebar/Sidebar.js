import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6 hidden md:flex flex-col shadow-lg">

      {/* Header */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold">Admin</h2>
          <p className="text-sm text-blue-100">Peminjaman Ruangan</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="space-y-2 flex-1">
        
        {/* Dashboard */}
        <NavLink
          to="/cms/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium
            ${isActive ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5-12v12m-14-12v12" />
          </svg>
          Dashboard
        </NavLink>

        {/* Tambah Admin */}
        <NavLink
          to="/cms/add-admin"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium
            ${isActive ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4v16m8-8H4" />
          </svg>
          Tambah Admin
        </NavLink>

        {/* Add Room */}
        <NavLink
          to="/cms/add-room"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium
            ${isActive ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 21h8m4-16H4m16 0v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5m16 0l-2-2H6L4 5" />
          </svg>
          Add Room
        </NavLink>

        {/* Monitoring Peminjaman */}
        <NavLink
          to="/cms/monitoring"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium
            ${isActive ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Monitoring Peminjaman
        </NavLink>

        {/* Manajemen User */}
        <NavLink
          to="/cms/manajemen-user"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium
            ${isActive ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6H2v-2a4 4 0 014-4h1m6-2a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
          Manajemen User
        </NavLink>

      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 transition font-medium mt-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
        </svg>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
