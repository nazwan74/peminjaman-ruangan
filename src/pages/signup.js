import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiUser } from "react-icons/fi";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validasi
    if (!name.trim()) {
      setError("Nama tidak boleh kosong");
      setLoading(false);
      return;
    }

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

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: "user",
        createdAt: new Date(),
      });

      navigate("/login");
    } catch (err) {
      console.error("Error:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar");
      } else if (err.code === "auth/invalid-email") {
        setError("Email tidak valid");
      } else if (err.code === "auth/weak-password") {
        setError("Password terlalu lemah (minimal 6 karakter)");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 tracking-tight">
          Buat Akun
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Daftar untuk mulai menggunakan aplikasi
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name input */}
          <div className="relative">
            <FiUser className="absolute left-3 top-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email input */}
          <div className="relative">
            <FiMail className="absolute left-3 top-3.5 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password input */}
          <div className="relative">
            <FiLock className="absolute left-3 top-3.5 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password input */}
          <div className="relative">
            <FiLock className="absolute left-3 top-3.5 text-gray-500" />
            <input
              type="password"
              placeholder="Konfirmasi Password"
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Signup button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition active:scale-95 ${
              loading && "opacity-70 cursor-not-allowed"
            }`}
          >
            {loading ? "Membuat Akun..." : "Buat Akun"}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-700">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-blue-700 font-semibold hover:underline"
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
