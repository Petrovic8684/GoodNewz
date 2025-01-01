import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdOutlinePhotoLibrary } from "react-icons/md";
import { FiMoon, FiSun } from "react-icons/fi";
import { LuLogOut } from "react-icons/lu";
import { FaEdit } from "react-icons/fa";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import Footer from "../components/Footer";
import baseUrl from "../config/baseUrl";
import useDarkMode from "../hooks/useDarkMode";

function SettingsPage() {
  const [user, setUser] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cropperRef = useRef(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const userId = window.localStorage.getItem("userId");
  const token = window.localStorage.getItem("token");

  useEffect(() => {
    handleImageCancel();
    handleEditCancel();

    fetchUserSettings();
  }, []);

  const handleImageCancel = () => {
    setIsModalOpen(false);
    setImage(null);
  };

  useEffect(() => {
    if (isEditing) setOriginalUsername(user?.username);
  }, [isEditing]);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user data!", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("userId");
    window.localStorage.removeItem("token");
    navigate("/");
  };

  const updateUsername = async (newUsername) => {
    try {
      const response = await axios.put(
        `${baseUrl}/users/${userId}`,
        { username: newUsername },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser((prev) => ({ ...prev, username: response.data.username }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user settings!", error);
      handleEditCancel();
    }
  };

  const handleEditCancel = () => {
    setUser((prev) => ({ ...prev, username: originalUsername }));
    setIsEditing(false);
  };

  const handleImageSelect = (e) => {
    setErrorMessage("");
    const file = e.target.files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (file && file.size > maxSize) {
      alert("File size exceeds the 5MB limit.");
      return;
    }
    if (file) {
      setImage(URL.createObjectURL(file));
      setIsModalOpen(true);
    }
  };

  const handleImageUpload = async () => {
    try {
      setLoadingUpload(true);
      if (cropperRef.current) {
        const cropper = cropperRef.current.cropper;
        const croppedCanvas = cropper.getCroppedCanvas();

        if (croppedCanvas) {
          const dataUrl = croppedCanvas.toDataURL();

          const response = await axios.post(
            `${baseUrl}/users/${userId}/uploadImage`,
            { image: dataUrl },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          setUser((prevUser) => ({
            ...prevUser,
            image: response.data.imageUrl,
          }));
        }

        setIsModalOpen(false);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || "An error occurred!");
      } else {
        setErrorMessage("An error occurred during the upload!");
      }
    } finally {
      setLoadingUpload(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-800">
        <div className="text-center text-2xl text-gray-700 dark:text-gray-200">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white dark:bg-slate-800">
      <div className="h-full flex flex-col items-center py-8 px-4">
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="relative w-full flex flex-col items-center">
            <div className="relative">
              <img
                src={user.image || "/images/unknown.jpg"}
                width={130}
                height={130}
                className="rounded-full object-cover border-4 border-gray-200 shadow-lg dark:border-gray-700"
                alt=""
              />

              <div className="absolute bottom-0 right-0">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  id="file-upload"
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="flex justify-center items-center w-10 h-10 bg-blue-400 dark:bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-500 dark:hover:bg-blue-700"
                >
                  <MdOutlinePhotoLibrary size={24} />
                </label>
              </div>
            </div>

            {/* Modal za cropovanje */}
            {isModalOpen && (
              <div className="modal fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                <div className="mx-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full">
                  <Cropper
                    id="cropper"
                    ref={cropperRef}
                    src={image}
                    style={{ height: 400, width: "100%" }}
                    aspectRatio={1}
                    viewMode={1}
                  />
                  {errorMessage && (
                    <div className="mt-4 text-center text-red-600 dark:text-red-400">
                      {errorMessage}
                    </div>
                  )}
                  <div className="mt-4 flex justify-between gap-4">
                    <button
                      onClick={handleImageUpload}
                      disabled={loadingUpload}
                      className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 ${
                        loadingUpload ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loadingUpload ? "Uploading..." : "Save"}
                    </button>
                    <button
                      onClick={handleImageCancel}
                      disabled={loadingUpload}
                      className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 mb-10 text-center w-full flex flex-col items-center gap-y-4">
            {isEditing ? (
              <input
                value={user.username}
                onChange={(e) =>
                  setUser((prev) => ({ ...prev, username: e.target.value }))
                }
                className="w-4/5 border border-gray-300 dark:border-gray-700 rounded text-center text-3xl font-semibold p-2 dark:bg-slate-800 text-gray-700 dark:text-gray-200"
              />
            ) : (
              <p className="text-3xl font-semibold text-gray-700 text-justify dark:text-gray-200">
                {user.username}
              </p>
            )}

            {isEditing ? (
              <div className="flex gap-x-4">
                <button
                  onClick={() => updateUsername(user.username)}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-600"
                >
                  Confirm
                </button>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-yellow-500 dark:text-yellow-400 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 p-2"
              >
                <FaEdit size={25} />
              </button>
            )}
          </div>

          <div className="sm:mt-14 mt-14 flex flex-col items-center gap-y-4">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
              <p className="text-gray-700 dark:text-gray-200">Dark Mode</p>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 dark:text-red-500 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              <LuLogOut size={24} className="mr-2" />
              <p>Logout</p>
            </button>
          </div>
        </div>
      </div>
      <Footer activePage="settings" />
    </main>
  );
}

export default SettingsPage;
