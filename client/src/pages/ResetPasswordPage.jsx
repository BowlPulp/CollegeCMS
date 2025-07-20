import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOTP, setEnteredOTP] = useState("");
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/otp/send-otp`, { email });
      setMessage("✅ OTP sent to your email.");
      setOtpSent(true);
    } catch (err) {
      setMessage("❌ Failed to send OTP.");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/otp/verify-otp`, {
        email,
        otp: enteredOTP,
      });
      if (res.data.success) {
        setMessage("✅ OTP verified. You can reset your password.");
        setVerified(true);
      } else {
        setMessage("❌ Invalid OTP.");
      }
    } catch (err) {
      setMessage("❌ OTP verification failed.");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/api/otp/reset-password`, {
        email,
        newPassword,
      });
      setMessage("✅ Password reset successful. Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setMessage("❌ Password reset failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--primary)] text-[var(--neutral)]">
      <div className="bg-[var(--secondary)] p-8 rounded-lg shadow-lg w-full max-w-md space-y-5">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>

        {message && (
          <p className="text-center text-sm font-medium text-yellow-200">
            {message}
          </p>
        )}

        {!otpSent && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg outline-none"
              style={{
                backgroundColor: "var(--neutral)",
                color: "var(--primary)",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleSendOTP}
              className="w-full py-2 rounded-lg bg-[var(--accent)] text-[var(--neutral)]"
            >
              Send OTP
            </button>
          </>
        )}

        {otpSent && !verified && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-3 rounded-lg outline-none"
              style={{
                backgroundColor: "var(--neutral)",
                color: "var(--primary)",
              }}
              value={enteredOTP}
              onChange={(e) => setEnteredOTP(e.target.value)}
            />
            <button
              onClick={handleVerifyOTP}
              className="w-full py-2 rounded-lg bg-[var(--accent)] text-[var(--neutral)]"
            >
              Verify OTP
            </button>
          </>
        )}

        {verified && (
          <>
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 rounded-lg outline-none"
              style={{
                backgroundColor: "var(--neutral)",
                color: "var(--primary)",
              }}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-3 rounded-lg outline-none"
              style={{
                backgroundColor: "var(--neutral)",
                color: "var(--primary)",
              }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              onClick={handleResetPassword}
              className="w-full py-2 rounded-lg bg-[var(--accent)] text-[var(--neutral)]"
            >
              Reset Password
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => navigate("/login")}
        className="mt-4 text-sm underline hover:text-yellow-300 transition"
      >
        Go back to Login
      </button>
    </div>
  );
}
