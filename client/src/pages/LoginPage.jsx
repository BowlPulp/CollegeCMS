import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in:", { email, password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 -mt-36"
      style={{ backgroundColor: "var(--primary)", color: "var(--neutral)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-lg"
        style={{ backgroundColor: "var(--secondary)" }}
      >
        {/* Title with Image */}
        <div className="flex flex-col items-center mb-6">
          <img
            src='chitkara.jpeg'
            alt="Chitkara"
            className="w-16 h-16 rounded-sm object-cover mb-2 shadow-md"
          />
          <h2
            className="text-3xl font-bold text-center"
            style={{ color: "var(--accent)" }}
          >
            Login
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg outline-none"
              style={{
                backgroundColor: "var(--neutral)",
                color: "var(--primary)",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg pr-10 outline-none"
                style={{
                  backgroundColor: "var(--neutral)",
                  color: "var(--primary)",
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold transition hover:opacity-90"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--neutral)",
            }}
          >
            Sign In
          </button>
        </form>

        {/* Optional Footer */}
        <p className="text-sm mt-6 text-center text-gray-300">
          Forgot Password?{" "}
          <span
            className="underline cursor-pointer"
            style={{ color: "var(--accent)" }}
          >
            Reset here!
          </span>
        </p>
      </div>
    </div>
  );
}
