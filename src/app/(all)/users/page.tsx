"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X,
  UserCog,
  User,
} from "lucide-react";
import { callApi } from "@/global/func";
import Image from "next/image";

// API functions
const fetchAllUsers = async () => {
  const response = await callApi("/user/all", "GET");

  if (response.error) {
    throw new Error(response.message || "Failed to fetch users");
  }

  return response.data;
};

const updateUser = async ({ userId, status, role }) => {
  const response = await callApi(`/user/updateUser/${userId}`, "PATCH", {
    status,
    role,
  });

  if (response.error) {
    throw new Error(response.message || "Failed to update user");
  }

  return response.data;
};

// User Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusClasses = () => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "banned":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusClasses()}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Role Badge Component
const RoleBadge = ({ role }) => {
  const getRoleClasses = () => {
    switch (role) {
      case "sudo":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "doctor":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "user":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleClasses()}`}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

// User Card Component
const UserCard = ({ user, onUpdate, currentUserRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState(user.status);
  const [editRole, setEditRole] = useState(user.role);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const handleSaveChanges = () => {
    onUpdate(user._id, editStatus, editRole);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditStatus(user.status);
    setEditRole(user.role);
    setIsEditing(false);
  };

  // Check if current admin can edit this user
  const canEdit = () => {
    // Sudo can edit anyone except other sudos
    if (currentUserRole === "sudo") {
      return user.role !== "sudo" || user._id === "current-user-id"; // Can edit self
    }

    // Admin can edit only users and doctors
    if (currentUserRole === "admin") {
      return ["user", "doctor"].includes(user.role);
    }

    return false;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            {user.logo && user.logo !== "Not provided" ? (
              <img
                src={user.logo}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{user.name}</h3>
              <p className="text-xs text-gray-500">{user.userName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status={user.status} />
            <RoleBadge role={user.role} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-gray-500">
            <Mail className="h-4 w-4 mr-1" />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center text-gray-500">
            <Phone className="h-4 w-4 mr-1" />
            <span>{user.phone || "No phone number"}</span>
          </div>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show More
              </>
            )}
          </button>

          {canEdit() && !isEditing && !isExpanded && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Gender</p>
              <p className="text-sm">{user.gender}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
              <p className="text-sm">{formatDate(user.dateOfBirth)}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Address</p>
              <p className="text-sm">
                {user.address !== "Not provided"
                  ? user.address
                  : "No address provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Joined</p>
              <p className="text-sm">{formatDate(user.createdAt)}</p>
            </div>
          </div>

          {canEdit() && !isEditing && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit User
              </button>
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <div className="border-t border-gray-200 p-4 bg-blue-50">
          <h4 className="font-medium text-gray-900 mb-3">Edit User</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={currentUserRole !== "sudo" && user.role === "admin"}
              >
                {/* Only sudo can assign sudo and admin roles */}
                {currentUserRole === "sudo" && (
                  <>
                    <option value="admin">Admin</option>
                    {/* Cannot change another sudo's role, but can change own role */}
                    {(user.role !== "sudo" ||
                      user._id === "current-user-id") && (
                      <option value="sudo">Sudo</option>
                    )}
                  </>
                )}
                <option value="user">User</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelEdit}
              className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </button>

            <button
              onClick={handleSaveChanges}
              className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Current user role - would typically come from auth context
  // This is a placeholder, you would replace this with actual auth data
  const currentUserRole = "admin"; // or 'sudo'

  const queryClient = useQueryClient();

  // Fetch all users
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
  });

  // Mutation for updating a user
  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate and refetch the users query
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Handler for updating user
  const handleUpdateUser = (userId, status, role) => {
    updateMutation.mutate({ userId, status, role });
  };

  // Filter and sort functionality
  const filteredUsers =
    data?.filter((user) => {
      const matchesStatus =
        filterStatus === "all" || user.status === filterStatus;
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesSearch =
        searchTerm === "" ||
        (user.name &&
          user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email &&
          user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.userName &&
          user.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone &&
          user.phone.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesRole && matchesSearch;
    }) || [];

  // Sort the filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "email":
        comparison = a.email.localeCompare(b.email);
        break;
      case "createdAt":
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "role":
        comparison = a.role.localeCompare(b.role);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-lg text-gray-700">Loading users...</span>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <AlertCircle className="h-8 w-8 mr-2" />
        <div>
          <p className="text-lg font-medium">Error loading users</p>
          <p className="text-sm">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const activeUsers =
    data?.filter((user) => user.status === "active").length || 0;
  const inactiveUsers =
    data?.filter((user) => user.status === "inactive").length || 0;
  const bannedUsers =
    data?.filter((user) => user.status === "banned").length || 0;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <UserCog className="h-6 w-6 mr-2" />
        User Management
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-lg font-medium text-gray-700">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">
            {data?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-lg font-medium text-gray-700">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-lg font-medium text-gray-700">Inactive</p>
          <p className="text-2xl font-bold text-yellow-600">{inactiveUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-lg font-medium text-gray-700">Banned</p>
          <p className="text-2xl font-bold text-red-600">{bannedUsers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-40">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <div className="sm:w-40">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
                <option value="sudo">Sudo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600 mr-2">Sort by:</span>
          <div className="flex flex-wrap gap-2">
            {["name", "email", "createdAt", "status", "role"].map((option) => (
              <button
                key={option}
                onClick={() => {
                  if (sortBy === option) {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy(option);
                    setSortOrder("asc");
                  }
                }}
                className={`px-2 py-1 text-xs rounded-md flex items-center ${
                  sortBy === option
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option === "createdAt"
                  ? "Joined Date"
                  : option.charAt(0).toUpperCase() + option.slice(1)}
                {sortBy === option &&
                  (sortOrder === "asc" ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  ))}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* No results */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No users found</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm || filterStatus !== "all" || filterRole !== "all"
              ? "Try adjusting your search or filters"
              : "There are no users in the system yet"}
          </p>
        </div>
      )}

      {/* Users list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedUsers.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            onUpdate={handleUpdateUser}
            currentUserRole={currentUserRole}
          />
        ))}
      </div>

      {/* Results count */}
      {filteredUsers.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredUsers.length} of {data?.length || 0} users
        </div>
      )}
    </div>
  );
}
