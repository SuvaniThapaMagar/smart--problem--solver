import React, { useState, useEffect } from "react";
import { IoPersonOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { BsUpload } from "react-icons/bs";

const Home = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]); // New state for uploaded images
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setUserId("unauthenticated");
    }
  }, []); // Empty dependency array

  useEffect(() => {
    // If the user is not authenticated, navigate to login
    if (userId === "unauthenticated") {
      navigate("/login", { replace: true });
    }
  }, [userId, navigate]);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUserId("unauthenticated");
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image to upload.");
      return;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or GIF).");
      return;
    }

    // Check file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("File size exceeds 5MB. Please choose a smaller file.");
      return;
    }

    const formData = new FormData();
    formData.append("images", file);
    formData.append("userId", userId);

    // Log formData contents (for debugging)
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    setLoading(true); // Set loading state to true

    try {
      const response = await fetch("http://localhost:4000/api/image/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Response status:", response.status);
        console.error("Response statusText:", response.statusText);
        console.error("Error data:", errorData);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Success data:", data);
      alert("Image uploaded successfully");

      // Update the uploaded images state with the returned images
      setUploadedImages(data.images);
    } catch (error) {
      console.error("Error object:", error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Only render the component content if the user is authenticated
  if (userId === null || userId === "unauthenticated") {
    return null; // or a loading indicator
  }
  console.log("Sending response to frontend:", uploadedImages);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        {/* Other Header Content */}
        <div className="flex-1"></div>{" "}
        {/* This empty div will push content to the right */}
        {/* Profile Icon */}
        <div className="relative">
          <button onClick={toggleDropdown}>
            <IoPersonOutline className="text-2xl" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
              <ul className="py-2">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col justify-center items-center">
        <h1 className="text-lg font-bold text-center">
          What problem did you encounter today?
        </h1>
        <p className="text-center">Upload your image to get your solution</p>

        {/* Image Upload */}
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button
          className="mt-10 border border-black p-4"
          onClick={handleUpload}
          disabled={loading} // Disable button while loading
        >
          {loading ? "Uploading..." : "Upload Image"} <BsUpload />
        </button>

        {/* Display Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold">Uploaded Images:</h2>
            {uploadedImages.map((image, index) => (
              <div key={index} className="my-4">
                <img
                  src={image.imageUrl}
                  alt={`Uploaded ${index}`}
                  className="max-w-xs"
                />
                <h3 className="font-semibold">Labels:</h3>
                <ul>
                  {Array.isArray(image.labels) ? (
                    image.labels.map((label, idx) => (
                      <li key={idx}>
                        {label.description || "Unknown"} - Confidence:
                        {label.score
                          ? `${Math.round(label.score * 100)}%`
                          : "N/A"}
                      </li>
                    ))
                  ) : (
                    <li>No labels available</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
