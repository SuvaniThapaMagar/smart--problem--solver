import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./Component/Home";
import LogIn from "./Component/Login";
import Register from "./Component/Register";
import { useState, useEffect } from "react";

const App = () => {
  // Set document title
  document.title = "Pixies World";

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false); // Ensure that it's reset if no token or userId is found
    }
  }, []);

  return (
    <Routes>
      {/* Default route: Redirect to either home or login based on authentication */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Login page: Redirect to home if authenticated */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <LogIn setIsAuthenticated={setIsAuthenticated} />
          )
        }
      />

      {/* Registration page: Always accessible */}
      <Route path="/sign-up" element={<Register />} />

      {/* Home page: Only accessible if authenticated */}
      <Route
        path="/home"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;
