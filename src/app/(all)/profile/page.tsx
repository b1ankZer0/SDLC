"use client";
import { useState, useEffect } from "react";
import { User, Edit, Save, X, Camera } from "lucide-react";
import { callApi } from "@/global/func";

// User profile interface based on your schema
interface UserProfile {
  _id: string;
  name: string;
  userName: string;
  email: string;
  logo: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  phone: string;
  status: "active" | "inactive" | "banned";
  role: "sudo" | "admin" | "user" | "doctor";
  address: string;
  createdAt: string;
  updatedAt: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Assuming you have an authentication token in localStorage
        const response = await callApi("/user/profile", "GET");

        if (response.error) {
          throw new Error(response.message || "Failed to fetch profile");
        }

        setUser(response.data); // Assuming your API returns data in a 'data' field
        setLoading(false);
      } catch (err) {
        setError("Error loading profile. Please try again.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No user profile found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {isEditing ? (
        <ProfileEditForm
          user={user}
          onCancel={() => setIsEditing(false)}
          onSave={(updatedUser) => {
            setUser(updatedUser);
            setIsEditing(false);
          }}
        />
      ) : (
        <ProfileView user={user} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
};

const ProfileView = ({
  user,
  onEdit,
}: {
  user: UserProfile;
  onEdit: () => void;
}) => {
  // Format date of birth
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <button
          onClick={onEdit}
          className="bg-white text-blue-600 rounded-full p-2 hover:bg-blue-50"
          aria-label="Edit profile"
        >
          <Edit size={20} />
        </button>
      </div>

      <div className="p-6">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <div className="relative">
            {user.logo && user.logo !== "Not provided" ? (
              <img
                src={user.logo}
                alt={`${user.name}'s profile`}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                <User size={64} className="text-blue-500" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1">
              <span className="inline-block w-3 h-3 bg-green-400 rounded-full"></span>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-600">@{user.userName}</p>
            <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
            <div
              className={`mt-2 inline-block ml-2 px-3 py-1 rounded-full text-sm
              ${
                user.status === "active"
                  ? "bg-green-100 text-green-800"
                  : user.status === "inactive"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{user.email}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="mt-1">{user.phone || "Not provided"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Gender</h3>
              <p className="mt-1 capitalize">{user.gender}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Date of Birth
              </h3>
              <p className="mt-1">{formatDate(user.dateOfBirth)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="mt-1">{user.address}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Member Since
              </h3>
              <p className="mt-1">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileEditForm = ({
  user,
  onCancel,
  onSave,
}: {
  user: UserProfile;
  onCancel: () => void;
  onSave: (user: UserProfile) => void;
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    gender: user.gender,
    dateOfBirth: user.dateOfBirth.split("T")[0], // Format for date input
    address: user.address,
    logo: user.logo,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(
    user.logo && user.logo !== "Not provided" ? user.logo : null
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string);
          // In a real app, you might want to store the file for upload
          // For now, we'll just store the preview URL
          setFormData((prev) => ({
            ...prev,
            logo: event.target?.result as string,
          }));
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // In a real app, you would send the updated data to your API
      // For demo purposes, we'll simulate a successful update

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create updated user object
      const updatedUser = {
        ...user,
        ...formData,
      };

      onSave(updatedUser);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        <button
          onClick={onCancel}
          className="bg-white text-blue-600 rounded-full p-2 hover:bg-blue-50"
          aria-label="Cancel edit"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                  <User size={64} className="text-blue-500" />
                </div>
              )}
              <label
                htmlFor="logo-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
              >
                <Camera size={32} className="text-white" />
              </label>
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Click to change profile picture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={60}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
