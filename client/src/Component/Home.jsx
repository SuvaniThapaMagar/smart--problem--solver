import React, { useState, useEffect } from "react";
import { IoPersonOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { BsUpload } from "react-icons/bs";

const Home = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setUserId("unauthenticated");
    }
  }, []);

  useEffect(() => {
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

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or GIF).");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size exceeds 5MB. Please choose a smaller file.");
      return;
    }

    const formData = new FormData();
    formData.append("images", file);
    formData.append("description", description);
    formData.append("userId", userId);

    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/image/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setUploadedImages(prev => [...prev, ...data]);
      alert("Image and description uploaded successfully");
    } catch (error) {
      console.error("Error object:", error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setLoading(false);
      setFile(null);
      setDescription("");
    }
  };

  if (userId === null || userId === "unauthenticated") {
    return null;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-gray-50">
      {/* Header */}
      <div className="w-full flex justify-between items-center p-4">
        <div className="flex-1"></div>
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
      <div className="flex-grow w-full max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-center mb-4">
            What problem did you encounter today?
          </h1>
          <p className="text-center mb-6">
            Upload your image to get your solution
          </p>

          {/* Upload Form */}
          <div className="max-w-md mx-auto space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <textarea
              placeholder="Write a description of the problem"
              value={description}
              onChange={handleDescriptionChange}
              className="w-full border border-gray-300 p-2 rounded min-h-[100px]"
            />
            <button
              className="w-full flex items-center justify-center gap-2 border border-black px-6 py-2 hover:bg-gray-200 rounded"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Image & Description"}
              <BsUpload />
            </button>
          </div>
        </div>

        {/* Results Display */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {uploadedImages.map((result, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                {/* Image and Description */}
                <div className="mb-6">
                  <img
                    src={result.image.imageUrl}
                    alt={result.image.description}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                  <p className="text-gray-700">{result.image.description}</p>
                </div>

                {/* Tutorials Section */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Related Tutorials:</h3>

                  {/* YouTube Video */}
                  {result.tutorials?.youtubeVideo?.link && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Recommended Video:</h4>
                      <a
                        href={result.tutorials.youtubeVideo.link}
                        className="text-blue-500 hover:underline block"
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {result.tutorials.youtubeVideo.title}
                      </a>
                    </div>
                  )}

                  {/* Google Links */}
                  {result.tutorials?.googleLinks?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Related Links:</h4>
                      <div className="space-y-1">
                        {result.tutorials.googleLinks.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link.link}
                            className="text-blue-500 hover:underline block"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;