import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { SiGmail } from "react-icons/si";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Show the success alert first
        alert("Registration successful! Please log in.");
        
        // Then navigate to login page
        navigate("/"); 
      } else {
        // Show error alert
        alert(data.message);
      }
    } catch (error) {
      alert("An error occurred while registering. Please try again.");
    }
  };
  

  const handleGoogleLogin = () => {
    // Perform a full page redirect to the backend Google auth route
    window.location.href = "http://localhost:4000/api/auth/google";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="bg-white ">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Create an Account
        </h1>

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

        <div className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-3 "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-3 "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="border p-3 "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleRegister}
          className="w-full bg-black text-white p-3  mt-6 hover:bg-gray-800"
        >
          Register
        </button>

        <NavLink to="/" className="block text-center mt-4">
          <p className="text-gray-500">Already have an account?</p>
          <strong className="text-blue-500">Login here</strong>
        </NavLink>
      </div>
    </div>
  );
};

export default Register;