import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import Swal from "sweetalert2";
import { db } from "../../services/firebase";
import Sidebar from "../../components/Sidebar/Sidebar";
import EditRoomCard from "../../components/EditRoomCard";

const AddRoom = () => {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [capacity, setCapacity] = useState("");
    const [facilities, setFacilities] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const [rooms, setRooms] = useState([]);
    const [fetching, setFetching] = useState(true);

    const [editingRoom, setEditingRoom] = useState(null);

    const fetchRooms = async () => {
        try {
            setFetching(true);
            const snap = await getDocs(collection(db, "rooms"));
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setRooms(list);
        } catch (err) {
            console.error("Fetch rooms error:", err);
            setError("Gagal memuat daftar ruangan");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

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
            await addDoc(collection(db, "rooms"), {
                name: name.trim(),
                location: location.trim(),
                capacity: Number(capacity),
                facilities: facilities.split(",").map((f) => f.trim()).filter(Boolean),
                createdAt: new Date(),
            });

            setSuccess("Ruangan berhasil ditambahkan");
            setName("");
            setLocation("");
            setCapacity("");
            setFacilities("");

            await fetchRooms();
        } catch (err) {
            console.error("Add room error:", err);
            setError("Gagal menambahkan ruangan");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Hapus Ruangan?",
            text: "Tindakan ini tidak bisa dibatalkan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya",
            cancelButtonText: "Batal"
        });

        if (!result.isConfirmed) return;

        try {
            await deleteDoc(doc(db, "rooms", id));
            setRooms((r) => r.filter((x) => x.id !== id));
            Swal.fire("Terhapus!", "Ruangan berhasil dihapus.", "success");
        } catch (err) {
            console.error("Delete room error:", err);
            Swal.fire("Error!", "Gagal menghapus ruangan.", "error");
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            <Sidebar />

            <main className="flex-1 p-8">
                <header className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Manajemen Ruangan</h1>
                    <p className="text-sm text-gray-500">Tambah, ubah dan hapus ruangan</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* FORM */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                                <span className="text-red-700 font-medium">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded">
                                <span className="text-green-700 font-medium">{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleAddRoom} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Nama Ruangan</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Lokasi</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Kapasitas</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Fasilitas (pisahkan dengan koma)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    value={facilities}
                                    onChange={(e) => setFacilities(e.target.value)}
                                    placeholder="AC, Proyektor, Wifi"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? "Menambahkan..." : "Tambah Ruangan"}
                            </button>
                        </form>
                    </div>

                    {/* LIST */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200 lg:col-span-2">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Daftar Ruangan</h2>

                        {fetching ? (
                            <p>Memuat...</p>
                        ) : rooms.length === 0 ? (
                            <p className="text-sm text-gray-500">Belum ada ruangan.</p>
                        ) : (
                            <div className="space-y-3">
                                {rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50"
                                    >
                                        <div>
                                            <div className="font-semibold text-gray-800">{room.name}</div>
                                            <div className="text-sm text-gray-500">
                                                Kapasitas: {room.capacity}
                                            </div>
                                            {room.location && (
                                                <div className="text-sm text-gray-500">
                                                    Lokasi: {room.location}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-x-2">
                                            <button
                                                onClick={() => setEditingRoom(room)}
                                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(room.id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {editingRoom && (
                <EditRoomCard
                    room={editingRoom}
                    onCancel={() => setEditingRoom(null)}
                    onSaved={() => {
                        fetchRooms();
                        setEditingRoom(null);
                    }}
                />
            )}
        </div>
    );
};

export default AddRoom;
