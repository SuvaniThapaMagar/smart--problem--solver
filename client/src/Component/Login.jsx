import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { SiGmail } from "react-icons/si";

const LogIn = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    console.log("URL params:", { token, error });

    if (token) {
      console.log("Token found in URL");
      localStorage.setItem("token", token);
      // Extract userId from JWT if possible
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.userId) {
          localStorage.setItem("userId", payload.userId);
        }
      } catch (e) {
        console.error("Error parsing JWT:", e);
      }
      setIsAuthenticated(true);
      // Use replace to prevent adding to history
      navigate("/home", { replace: true });
    } else if (error) {
      console.log("Error found in URL:", error);
      alert("Login failed. Please try again.");
    }
  }, [location.search, setIsAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      console.log("Attempting login with:", { email, password });
      const response = await fetch("http://localhost:4000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        setIsAuthenticated(true);
        navigate("/home", { replace: true });
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred while logging in. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Redirecting to Google login...");
    window.location.href = "http://localhost:4000/api/auth/google";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="bg-white ">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome Back</h1>

        {/* Google Login Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleGoogleLogin}
            className="border border-black p-2 w-full flex justify-center items-center gap-2 hover:bg-gray-200"
          >
            Continue with Gmail
            <SiGmail className="text-red-500" />
          </button>
        </div>

        <p className="text-center mb-4">or</p>

        {/* Email and Password Input Fields */}
        <div className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-3 mt-6 hover:bg-gray-800"
        >
          Login
        </button>

        {/* Link to Sign Up */}
        <NavLink to="/sign-up" className="block text-center mt-4">
          <p className="text-gray-500">No account?</p>
          <strong className="text-blue-500">Create one</strong>
        </NavLink>
      </div>
    </div>
  );
};

export default LogIn;
