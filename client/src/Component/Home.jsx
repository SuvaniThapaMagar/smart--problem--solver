import React, { useState, useEffect } from "react";
import { IoPersonOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { BsUpload } from "react-icons/bs";

const Home = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState(""); // New state for description
  const [userId, setUserId] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]); // State for uploaded images
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

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image to upload.");
      return;
    }

    if (!description) {
      alert("Please enter a description.");
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
    formData.append("description", description); // Add description to the form data
    formData.append("userId", userId);

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

      // Ensure we're setting the correct data structure
      // If data.images exists, use it; otherwise, wrap the data in an array
      setUploadedImages(data.images || [data] || []);
      alert("Image and description uploaded successfully");
    } catch (error) {
      console.error("Error object:", error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Only render the component content if the user is authenticated
  if (userId === null || userId === "unauthenticated") {
    return null; // or a loading indicator
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-gray-50">
      {/* Header */}
      <div className="w-full flex justify-between items-center p-4">
        <div className="flex-1"></div> {/* Push content to the right */}
        {/* Profile Icon */}
        <div className="relative">
          <button onClick={toggleDropdown}>
            <IoPersonOutline className="text-2xl" />
          </button>
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
      <div className="flex-grow w-full flex flex-col justify-center items-center p-8">
        <h1 className="text-xl font-bold text-center mb-4">
          What problem did you encounter today?
        </h1>
        <p className="text-center mb-6">
          Upload your image to get your solution
        </p>

        {/* Image Upload and Description Input */}
        <input
          type="file"
          accept="image/*"
          className="mb-4"
          onChange={handleFileChange}
        />
        <textarea
          placeholder="Write a description of the problem"
          value={description}
          onChange={handleDescriptionChange}
          className="w-full max-w-md border border-gray-300 p-2 mb-6"
        />
        <button
          className="mb-6 border border-black px-6 py-2 hover:bg-gray-200"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Image & Description"} <BsUpload />
        </button>

        

        {/* Two-column layout */}
        <div className="flex justify-between w-full max-w-4xl">
          {/* Left side for images */}
          {/* Right side for links */}
          <div className="ml-4 w-1/4">
  <div className="flex flex-col space-y-4">
    {Array.isArray(uploadedImages) && uploadedImages.length > 0 ? (
      uploadedImages.map((imageData, index) => (
        <div key={index} className="space-y-2">
          <h3 className="font-bold">Related Tutorials:</h3>

          {/* YouTube Video */}
          {imageData.tutorials?.youtubeVideo && (
            <div>
              <h4 className="font-semibold">Recommended Video:</h4>
              <a
                href={imageData.tutorials.youtubeVideo.link}  // Link to the video
                className="text-blue-500 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {imageData.tutorials.youtubeVideo.title} {/* Title of the video */}
              </a>
            </div>
          )}

          {/* Google Links */}
          {Array.isArray(imageData.tutorials?.googleLinks) && imageData.tutorials.googleLinks.length > 0 && (
            <div>
              <h4 className="font-semibold">Related Links:</h4>
              {imageData.tutorials.googleLinks.map((link, linkIndex) => (
                <a
                  key={linkIndex}
                  href={link.link}  // Link to the resource
                  className="text-blue-500 hover:underline block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.title} {/* Title of the link */}
                </a>
              ))}
            </div>
          )}
        </div>
      ))
    ) : (
      <p>No tutorials available yet.</p>
    )}
  </div>
</div>



        </div>
      </div>
    </div>
  );
};

export default Home;
