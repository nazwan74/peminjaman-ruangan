import React from "react";
import { FiMapPin, FiUsers, FiWifi } from "react-icons/fi";

const RoomCard = ({ room, onBook }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">{room.name}</h3>
        {room.location && (
          <div className="flex items-center gap-2 text-blue-100">
            <FiMapPin className="w-4 h-4" />
            <span className="text-sm">{room.location}</span>
          </div>
        )}
      </div>

      {/* Body Card */}
      <div className="p-6">
        {/* Kapasitas */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiUsers className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Kapasitas</p>
            <p className="font-semibold text-gray-800">{room.capacity} orang</p>
          </div>
        </div>

        {/* Fasilitas */}
        {room.facilities && room.facilities.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Fasilitas:</p>
            <div className="flex flex-wrap gap-2">
              {room.facilities.map((facility, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Button Book */}
        {onBook && (
          <button
            onClick={() => onBook(room)}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition active:scale-95"
          >
            Pinjam Ruangan
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomCard;

