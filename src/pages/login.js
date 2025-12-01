import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError("User tidak memiliki role di Firestore");
        setLoading(false);
        return;
      }

      const role = docSnap.data().role;
      navigate(role === "admin" ? "/cms/dashboard" : "/home");
    } catch (err) {
      console.error("Error detail:", err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Email atau password salah");
      } else if (err.code === "auth/invalid-email") {
        setError("Format email tidak valid");
      } else if (err.code === "auth/user-disabled") {
        setError("Akun telah dinonaktifkan");
      } else {
        setError("Gagal login. Coba lagi");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 tracking-tight">
          Selamat Datang
        </h2>
        <p className="text-center text-gray-600 mb-6">Silakan login untuk melanjutkan</p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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

          {/* Login button */}
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition active:scale-95 ${
              loading && "opacity-70 cursor-not-allowed"
            }`}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-700">
          Belum punya akun?{" "}
          <Link to="/signup" className="text-blue-700 font-semibold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
