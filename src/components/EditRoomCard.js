import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const EditRoomCard = ({ room, onCancel, onSaved }) => {
  const [name, setName] = useState(room.name || "");
  const [location, setLocation] = useState(room.location || "");
  const [capacity, setCapacity] = useState(room.capacity || "");
  const [facilities, setFacilities] = useState((room.facilities || []).join(", "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama ruangan harus diisi");
      return;
    }
    if (!capacity || isNaN(capacity) || Number(capacity) <= 0) {
      setError("Kapasitas harus berupa angka lebih besar dari 0");
      return;
    }

    setLoading(true);
    try {
      const roomRef = doc(db, "rooms", room.id);
      await updateDoc(roomRef, {
        name: name.trim(),
        location: location.trim(),
        capacity: Number(capacity),
        facilities: facilities.split(",").map((f) => f.trim()).filter(Boolean),
      });
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Update room error:", err);
      setError(err.message || "Gagal menyimpan perubahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Ruangan</h3>
        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">{error}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ruangan</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
            <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fasilitas (pisahkan dengan koma)</label>
            <input value={facilities} onChange={(e) => setFacilities(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500" />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-60">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoomCard;
