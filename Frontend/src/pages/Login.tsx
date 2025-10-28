import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminAPI } from "@/services/api";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordRef = useRef<HTMLInputElement>(null); // 👈 reference for password field

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();

    if (!normalizedEmail || !sanitizedPassword) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await adminAPI.login(normalizedEmail, sanitizedPassword);

      if (response.data) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("email", normalizedEmail);

        // Store admin details if provided
        if (response.data.admin) {
          localStorage.setItem("adminId", response.data.admin.admin_id);
          localStorage.setItem("adminName", response.data.admin.full_name);
        }

        toast.success("Login successful!");

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 50);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (!err.response
          ? "Unable to reach the server. Please check that the backend is running."
          : "Invalid email or password");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Welcome Section */}
      <div
        className="flex-1 flex items-center justify-center p-8 md:p-0 order-1 md:order-1"
        style={{ backgroundColor: "#EEF1FF" }}
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Welcome Back!
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-8 text-gray-700">
            Login to start work
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 order-2 md:order-2">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    passwordRef.current?.focus(); // 👈 jump to password
                  }
                }}
                className="w-full border-gray-300"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <Input
                ref={passwordRef}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLogin(); // 👈 press Enter to log in
                  }
                }}
                className="w-full border-gray-300"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 text-sm font-medium text-center">
                {error}
              </p>
            )}

            {/* Login Button */}
            <Button
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 text-base"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Log in"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
