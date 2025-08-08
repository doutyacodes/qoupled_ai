// app/connections/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Search,
  UserPlus,
  UserCheck,
  Clock,
  Filter,
  ChevronDown,
  CheckCircle,
  X,
} from "lucide-react";
import ModernNavbar from "@/app/_components/Navbar";
import Image from "next/image";

const BASE_IMAGE_URL = "https://wowfy.in/wowfy_app_codebase/photos/";

export default function ConnectionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("connections");
  const [connections, setConnections] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest or oldest
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Reset pagination when tab changes
    setCurrentPage(1);

    // Load data based on active tab
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/connections/${tab}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      switch (tab) {
        case "connections":
          setConnections(data.connections);
          break;
        case "sent-invites":
          setSentInvites(data.invites);
          break;
        case "received-invites":
          setReceivedInvites(data.invites);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (connectionId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/connections/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          connectionId,
          status: "accepted",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept invitation");
      }

      // Update the received invites list
      setReceivedInvites((prev) =>
        prev.filter((invite) => invite.connectionId !== connectionId)
      );

      // Refresh connections tab data
      fetchData("connections");
    } catch (error) {
      console.error("Error accepting invitation:", error);
    }
  };

  const handleRejectInvite = async (connectionId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/connections/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          connectionId,
          status: "rejected",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject invitation");
      }

      // Update the received invites list
      setReceivedInvites((prev) =>
        prev.filter((invite) => invite.connectionId !== connectionId)
      );
    } catch (error) {
      console.error("Error rejecting invitation:", error);
    }
  };

  const handleViewProfile = (userId) => {
    router.push(`/profile/${userId}/view-profile`);
  };

  const filterItems = (items) => {
    if (!items) return [];

    // Filter by search term
    let filtered = items.filter((item) =>
      item.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(
        sortBy === "newest"
          ? a.respondedAt || a.requestedAt
          : a.respondedAt || a.requestedAt
      );
      const dateB = new Date(
        sortBy === "newest"
          ? b.respondedAt || b.requestedAt
          : a.respondedAt || a.requestedAt
      );

      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const getPaginatedItems = (items) => {
    const filtered = filterItems(items);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = (items) => {
    return Math.ceil(filterItems(items).length / itemsPerPage);
  };

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500">
      {/* Navbar */}
       {/* <ModernNavbar /> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-rose-500 to-red-600 text-white">
              <div className="flex items-center justify-center">
                <Image src={"/transparent_logo.png"} width={50} height={40} />

                <h1 className="text-2xl font-bold">Manage Connections</h1>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row border-b">
              <button
                className={`flex-1 py-5 font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === "connections"
                    ? "text-rose-600 border-rose-600"
                    : "text-gray-500 border-transparent hover:text-rose-500"
                }`}
                onClick={() => setActiveTab("connections")}
              >
                <div className="flex items-center justify-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  <span>My Connections</span>
                </div>
              </button>
              <button
                className={`flex-1 py-5 font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === "sent-invites"
                    ? "text-rose-600 border-rose-600"
                    : "text-gray-500 border-transparent hover:text-rose-500"
                }`}
                onClick={() => setActiveTab("sent-invites")}
              >
                <div className="flex items-center justify-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  <span>Sent Invites</span>
                </div>
              </button>
              <button
                className={`flex-1 py-5 font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === "received-invites"
                    ? "text-rose-600 border-rose-600"
                    : "text-gray-500 border-transparent hover:text-rose-500"
                }`}
                onClick={() => setActiveTab("received-invites")}
              >
                <div className="flex items-center justify-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Received Invites</span>
                </div>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-base"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter Button */}
                <div className="relative">
                  <button
                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200 text-base"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter className="h-5 w-5 mr-2 text-gray-600" />
                    <span className="text-gray-600">Sort</span>
                    <ChevronDown
                      className={`h-5 w-5 ml-2 text-gray-600 transition-transform duration-200 ${
                        isFilterOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Filter Dropdown */}
                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-100">
                      <button
                        className={`w-full px-4 py-3 text-left hover:bg-rose-50 ${
                          sortBy === "newest"
                            ? "text-rose-600 font-medium"
                            : "text-gray-700"
                        }`}
                        onClick={() => {
                          setSortBy("newest");
                          setIsFilterOpen(false);
                        }}
                      >
                        Newest First
                      </button>
                      <button
                        className={`w-full px-4 py-3 text-left hover:bg-rose-50 ${
                          sortBy === "oldest"
                            ? "text-rose-600 font-medium"
                            : "text-gray-700"
                        }`}
                        onClick={() => {
                          setSortBy("oldest");
                          setIsFilterOpen(false);
                        }}
                      >
                        Oldest First
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-rose-500"></div>
                </div>
              ) : (
                <>
                  {/* My Connections Tab */}
                  {activeTab === "connections" && (
                    <>
                      {getPaginatedItems(connections).length > 0 ? (
                        <div className="space-y-5">
                          {getPaginatedItems(connections).map((connection) => (
                            <div
                              key={connection.connectionId}
                              className="border border-gray-200 rounded-xl p-5 hover:border-rose-300 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex flex-col sm:flex-row items-center">
                                <div className="flex-shrink-0 mb-4 sm:mb-0">
                                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-rose-100 shadow-md">
                                    <img
                                      src={
                                        connection.profileImageUrl
                                          ? `${BASE_IMAGE_URL}${connection.profileImageUrl}`
                                          : "/default-avatar.png"
                                      }
                                      alt={connection.username}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                                <div className="sm:ml-6 flex-1 text-center sm:text-left">
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {connection.username}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Connected since:{" "}
                                    {formatDate(connection.respondedAt)}
                                  </p>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                  <button
                                    onClick={() =>
                                      handleViewProfile(connection.userId)
                                    }
                                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors duration-200 font-medium"
                                  >
                                    View Profile
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="text-gray-400 mb-4">
                            <UserCheck className="h-16 w-16 mx-auto" />
                          </div>
                          <h3 className="text-xl font-medium text-gray-900">
                            No connections yet
                          </h3>
                          <p className="text-gray-500 mt-2">
                            Start by sending connection requests to other users
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Sent Invites Tab */}
                  {activeTab === "sent-invites" && (
                    <>
                      {getPaginatedItems(sentInvites).length > 0 ? (
                        <div className="space-y-5">
                          {getPaginatedItems(sentInvites).map((invite) => (
                            <div
                              key={invite.connectionId}
                              className="border border-gray-200 rounded-xl p-5 hover:border-rose-300 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex flex-col sm:flex-row items-center">
                                <div className="flex-shrink-0 mb-4 sm:mb-0">
                                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-rose-100 shadow-md">
                                    <img
                                      src={
                                        invite.profileImageUrl
                                          ? `${BASE_IMAGE_URL}${invite.profileImageUrl}`
                                          : "/default-avatar.png"
                                      }
                                      alt={invite.username}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                                <div className="sm:ml-6 flex-1 text-center sm:text-left">
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {invite.username}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    <span className="inline-flex items-center">
                                      <Clock className="h-4 w-4 mr-1 text-amber-500" />
                                      Request sent:{" "}
                                      {formatDate(invite.requestedAt)}
                                    </span>
                                  </p>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                  <button
                                    onClick={() =>
                                      handleViewProfile(invite.userId)
                                    }
                                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors duration-200 font-medium"
                                  >
                                    View Profile
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="text-gray-400 mb-4">
                            <UserPlus className="h-16 w-16 mx-auto" />
                          </div>
                          <h3 className="text-xl font-medium text-gray-900">
                            No sent invites
                          </h3>
                          <p className="text-gray-500 mt-2">
                            You haven't sent any connection requests yet
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Received Invites Tab */}
                  {activeTab === "received-invites" && (
                    <>
                      {getPaginatedItems(receivedInvites).length > 0 ? (
                        <div className="space-y-5">
                          {getPaginatedItems(receivedInvites).map((invite) => (
                            <div
                              key={invite.connectionId}
                              className="border border-gray-200 rounded-xl p-5 hover:border-rose-300 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex flex-col items-center">
                                <div className="flex-shrink-0 mb-4">
                                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-rose-100 shadow-md">
                                    <img
                                      src={
                                        invite.profileImageUrl
                                          ? `${BASE_IMAGE_URL}${invite.profileImageUrl}`
                                          : "/default-avatar.png"
                                      }
                                      alt={invite.username}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                                <div className="text-center">
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {invite.username}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    <span className="inline-flex items-center">
                                      <Clock className="h-4 w-4 mr-1 text-amber-500" />
                                      Received: {formatDate(invite.requestedAt)}
                                    </span>
                                  </p>
                                </div>

                                <div className="flex flex-col sm:flex-row mt-5 gap-3 w-full justify-center">
                                  <button
                                    onClick={() =>
                                      handleViewProfile(invite.userId)
                                    }
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium w-full sm:w-auto"
                                  >
                                    View Profile
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAcceptInvite(invite.connectionId)
                                    }
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center font-medium w-full sm:w-auto"
                                  >
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectInvite(invite.connectionId)
                                    }
                                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center font-medium w-full sm:w-auto"
                                  >
                                    <X className="h-5 w-5 mr-2" />
                                    Decline
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="text-gray-400 mb-4">
                            <Clock className="h-16 w-16 mx-auto" />
                          </div>
                          <h3 className="text-xl font-medium text-gray-900">
                            No received invites
                          </h3>
                          <p className="text-gray-500 mt-2">
                            You don't have any pending connection requests
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Pagination */}
                  {totalPages(
                    activeTab === "connections"
                      ? connections
                      : activeTab === "sent-invites"
                      ? sentInvites
                      : receivedInvites
                  ) > 1 && (
                    <div className="flex justify-center mt-10">
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          Previous
                        </button>

                        {Array.from(
                          {
                            length: totalPages(
                              activeTab === "connections"
                                ? connections
                                : activeTab === "sent-invites"
                                ? sentInvites
                                : receivedInvites
                            ),
                          },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-md ${
                              currentPage === page
                                ? "bg-rose-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(
                                totalPages(
                                  activeTab === "connections"
                                    ? connections
                                    : activeTab === "sent-invites"
                                    ? sentInvites
                                    : receivedInvites
                                ),
                                currentPage + 1
                              )
                            )
                          }
                          disabled={
                            currentPage ===
                            totalPages(
                              activeTab === "connections"
                                ? connections
                                : activeTab === "sent-invites"
                                ? sentInvites
                                : receivedInvites
                            )
                          }
                          className={`px-4 py-2 rounded-md ${
                            currentPage ===
                            totalPages(
                              activeTab === "connections"
                                ? connections
                                : activeTab === "sent-invites"
                                ? sentInvites
                                : receivedInvites
                            )
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
