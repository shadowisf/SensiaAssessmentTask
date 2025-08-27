import { useState } from "react";
import emailjs from "@emailjs/browser";
import ErrorMessage from "../../components/ErrorMessage";
import SuccessMessage from "../../components/SuccessMessage";
import Spinner from "../../components/Spinner";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  async function handleSendOTP() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("http://localhost:8000/api/requestOtp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send OTP");

      await emailjs.send(
        "service_ee6y6rw",
        "template_ycmbvsd",
        { otp: data.otp, to_name: email, to_email: email },
        { publicKey: "IQK6m6KVn2GfsEzlU" }
      );

      setOtpSent(true);
      setSuccess("OTP has been sent to your email.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOTP() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("http://localhost:8000/api/verifyOtp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "OTP verification failed");

      setOtpVerified(true);
      setSuccess("OTP verified. Enter a new password below.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Reset Password
  async function handleResetPassword() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("http://localhost:8000/api/resetPassword/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reset password");

      setSubmitted(true); // <-- mark as submitted
      setSuccess("Password reset successfully. Redirecting...");
    } catch (err: any) {
      setError(err.message);
      setLoading(false); // allow retry if failed
    } finally {
      // redirect after 3s
      setTimeout(() => navigate("/user-login"), 3000);
    }
  }

  return (
    <>
      {loading && <Spinner />}
      <main className="login-wrapper">
        <div>
          <h1>Password Recovery</h1>
        </div>
        {!submitted && (
          <div className="input-container">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent}
            />

            {otpSent && (
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            )}

            {otpVerified && (
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            )}

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
          </div>
        )}
        {!submitted && !otpSent && (
          <button onClick={handleSendOTP} disabled={!email}>
            Send OTP
          </button>
        )}
        {!submitted && otpSent && !otpVerified && (
          <button onClick={handleVerifyOTP} disabled={!otp}>
            Verify OTP
          </button>
        )}
        {!submitted && otpVerified && (
          <button
            onClick={handleResetPassword}
            disabled={!newPassword || newPassword.length < 6}
          >
            Reset Password
          </button>
        )}
        {submitted && <Spinner />} {/* spinner until redirect */}
      </main>
    </>
  );
}
