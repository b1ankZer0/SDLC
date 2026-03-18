"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/global/hook/useUser";

export default function Navbar() {
  const { user, loading, isAuthenticated, logout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (event.target instanceof Element) {
        // Close profile dropdown if open and click is outside
        if (
          isProfileDropdownOpen &&
          !event.target.closest("[data-profile-dropdown]")
        ) {
          setIsProfileDropdownOpen(false);
        }

        // Close services dropdown if open and click is outside
        if (
          isServicesDropdownOpen &&
          !event.target.closest("[data-services-dropdown]")
        ) {
          setIsServicesDropdownOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen, isServicesDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close dropdown when clicking any option
  const handleDropdownItemClick = () => {
    setIsServicesDropdownOpen(false);
  };

  // Render role-based service options
  const renderRoleBasedServiceOptions = () => {
    if (!user || !user.role) return null;

    switch (user.role) {
      case "doctor":
        return (
          <Link
            href="/schedule"
            onClick={handleDropdownItemClick}
            className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2"
          >
            <div className="mr-3 p-1.5 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors duration-200">
              <svg
                className="h-4 w-4 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="font-medium">Schedule</div>
              <div className="text-xs text-gray-500">
                Manage your appointments
              </div>
            </div>
          </Link>
        );
      case "sudo":
        return (
          <>
            <Link
              href="/users"
              onClick={handleDropdownItemClick}
              className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2"
            >
              <div className="mr-3 p-1.5 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors duration-200">
                <svg
                  className="h-4 w-4 text-purple-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">User Management</div>
                <div className="text-xs text-gray-500">Manage system users</div>
              </div>
            </Link>
            <Link
              href="/role-requests"
              onClick={handleDropdownItemClick}
              className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2"
            >
              <div className="mr-3 p-1.5 rounded-lg bg-amber-100 group-hover:bg-amber-200 transition-colors duration-200">
                <svg
                  className="h-4 w-4 text-amber-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1 .257-.257A6 6 0 1118 8zm-6-4a1 1 0 100 2h2a1 1 0 100-2h-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium">Role Requests</div>
                <div className="text-xs text-gray-500">
                  Review role requests
                </div>
              </div>
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                H+
              </div>
              <span className="ml-2 text-xl font-bold text-gray-800">
                HealthSync
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 
                  ${
                    pathname === "/"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } 
                  text-sm font-medium transition-colors duration-200`}
              >
                Home
              </Link>

              {/* Modern Services Dropdown */}
              <div className="relative" data-services-dropdown>
                <button
                  onClick={() =>
                    setIsServicesDropdownOpen(!isServicesDropdownOpen)
                  }
                  className={`inline-flex items-center px-1 pt-1 border-b-2 
                    ${
                      pathname.startsWith("/services") ||
                      pathname.startsWith("/find-doctor") ||
                      pathname.startsWith("/appointment-management") ||
                      pathname.startsWith("/problems")
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } 
                    text-sm font-medium focus:outline-none transition-all duration-200`}
                >
                  Services
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform duration-300 ${
                      isServicesDropdownOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {isServicesDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-72 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 backdrop-blur-sm border border-gray-100"
                    data-services-dropdown
                  >
                    <div className="py-2">
                      {/* Find Doctor - Always visible */}
                      <Link
                        href="/find-doctor"
                        onClick={handleDropdownItemClick}
                        className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2"
                      >
                        <div className="mr-3 p-1.5 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors duration-200">
                          <svg
                            className="h-4 w-4 text-green-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Find a Doctor</div>
                          <div className="text-xs text-gray-500">
                            Search for healthcare providers
                          </div>
                        </div>
                      </Link>
                      <Link
                        href="/medicines"
                        onClick={handleDropdownItemClick}
                        className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2"
                      >
                        <div className="mr-3 p-1.5 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors duration-200">
                          <svg
                            className="h-4 w-4 text-blue-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {/* Pill Icon Path */}
                            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                            <path d="m8.5 8.5 7 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Medicines</div>
                          <div className="text-xs text-gray-500">
                            Search for medication and drug details
                          </div>
                        </div>
                      </Link>

                      {/* Appointments - Only for logged in users */}
                      {isAuthenticated && (
                        <Link
                          href="/appointment-management"
                          onClick={handleDropdownItemClick}
                          className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2"
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors duration-200">
                            <svg
                              className="h-4 w-4 text-indigo-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Appointments</div>
                            <div className="text-xs text-gray-500">
                              Book and manage appointments
                            </div>
                          </div>
                        </Link>
                      )}

                      {/* Role-based options - Only for logged in users */}
                      {isAuthenticated && renderRoleBasedServiceOptions()}

                      {/* Medical Problems - Only for logged in users */}
                      {isAuthenticated && (
                        <Link
                          href="/problems"
                          onClick={handleDropdownItemClick}
                          className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2"
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors duration-200">
                            <svg
                              className="h-4 w-4 text-red-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Medical Problems</div>
                            <div className="text-xs text-gray-500">
                              Browse medical conditions
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/about"
                className={`inline-flex items-center px-1 pt-1 border-b-2 
                  ${
                    pathname === "/about"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } 
                  text-sm font-medium transition-colors duration-200`}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className={`inline-flex items-center px-1 pt-1 border-b-2 
                  ${
                    pathname === "/contact"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } 
                  text-sm font-medium transition-colors duration-200`}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Right side: Login/Register or User options */}
          <div className="hidden md:flex items-center">
            {loading ? (
              <div className="flex items-center">
                <div className="animate-pulse h-5 w-16 bg-gray-200 rounded"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="ml-4 flex items-center md:ml-6">
                {/* Notification bell */}
                <button className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-all duration-200">
                  <span className="sr-only">View notifications</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>

                {/* User profile button - separate from dropdown */}
                <Link
                  href="/profile"
                  className="ml-3 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all hover:scale-105"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-lg overflow-hidden ring-2 ring-white">
                    {user?.logo && user.logo !== "Not provided" ? (
                      <img
                        src={user.logo}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{user?.name?.charAt(0)}</span>
                    )}
                  </div>
                </Link>

                {/* User dropdown - separate from profile button */}
                <div className="ml-3 relative" data-profile-dropdown>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center text-sm rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 p-1 hover:bg-blue-50"
                    aria-expanded={isProfileDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-all duration-300 ${
                        isProfileDropdownOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isProfileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 backdrop-blur-sm border border-gray-100"
                      data-profile-dropdown
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                        <p className="text-xs text-gray-500 font-medium">
                          Signed in as
                        </p>
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2"
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors duration-200">
                            <svg
                              className="h-4 w-4 text-blue-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                          </div>
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2"
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors duration-200">
                            <svg
                              className="h-4 w-4 text-green-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2"
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200">
                            <svg
                              className="h-4 w-4 text-gray-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          Settings
                        </Link>
                      </div>
                      <div className="py-2 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="group flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 rounded-lg mx-2"
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors duration-200">
                            <svg
                              className="h-4 w-4 text-red-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:hidden bg-white border-t`}
      >
        <div className="pt-2 pb-3 space-y-1">
          {/* Mobile Navigation Links */}
          <Link
            href="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === "/"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
            } transition-colors duration-200`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>

          {/* Mobile Services Section */}
          <div className="border-l-4 border-transparent">
            <div className="pl-3 pr-4 py-2">
              <div className="text-base font-medium text-gray-600 mb-2">
                Services
              </div>

              {/* Find Doctor - Always visible */}
              <Link
                href="/find-doctor"
                className="block pl-4 pr-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Find a Doctor
              </Link>

              <Link
                href="/medicines"
                className="block pl-4 pr-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Medicines
              </Link>

              {/* Authenticated user services */}
              {isAuthenticated && (
                <>
                  <Link
                    href="/appointment-management"
                    className="block pl-4 pr-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Appointments
                  </Link>

                  {/* Role-based mobile options */}
                  {user?.role === "doctor" && (
                    <Link
                      href="/schedule"
                      className="block pl-4 pr-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Schedule
                    </Link>
                  )}

                  {user?.role === "sudo" && (
                    <>
                      <Link
                        href="/users"
                        className="block pl-4 pr-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        User Management
                      </Link>
                      <Link
                        href="/role-requests"
                        className="block pl-4 pr-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Role Requests
                      </Link>
                    </>
                  )}

                  <Link
                    href="/problems"
                    className="block pl-4 pr-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Medical Problems
                  </Link>
                </>
              )}
            </div>
          </div>

          <Link
            href="/about"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === "/about"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
            } transition-colors duration-200`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About Us
          </Link>

          <Link
            href="/contact"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === "/contact"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
            } transition-colors duration-200`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </Link>
        </div>

        {/* Mobile User Section */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          {loading ? (
            <div className="flex items-center px-4">
              <div className="animate-pulse h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="ml-3 animate-pulse h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-lg overflow-hidden ring-2 ring-white">
                    {user?.logo && user.logo !== "Not provided" ? (
                      <img
                        src={user.logo}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{user?.name?.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.name}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 space-y-2">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-md shadow-md transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
