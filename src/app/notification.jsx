"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import userApi from "../api";
import FreelanstersLogo from "../assets/Freelansters.svg";

const NotificationPage = () => {
  const session = localStorage.getItem("session");
  const user = session ? JSON.parse(session) : null;
  const socket = useMemo(
    () => io(import.meta.env.VITE_API_URL, { auth: { token: user.token } }),
    [user.token]
  );

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch notifications on component mount
    fetchNotifications();

    // Listen for new notifications via Socket.IO
    socket.on("new-notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    // Cleanup listeners
    return () => {
      socket.off("new-notification");
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await userApi.get("/notifications", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!response.data || !Array.isArray(response.data.notifications)) {
        throw new Error("Invalid response format");
      }

      // Sort notifications by date (newest first)
      const sortedNotifications = response.data.notifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifications(sortedNotifications || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications. Please try again later.");
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await userApi.put(
        `/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );

      socket.emit("mark-as-read", { notificationId });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await userApi.put(
        "/notifications/mark-all-as-read",
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      socket.emit("mark-all-as-read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await userApi.delete(`/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await userApi.delete("/notifications/delete-all", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  // Filter notifications based on active filter and search term
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesFilter =
        activeFilter === "all" || activeFilter === notification.type;

      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [notifications, activeFilter, searchTerm]);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Get unique notification types for filter options
  const notificationTypes = useMemo(() => {
    const types = new Set(notifications.map((n) => n.type));
    return ["all", ...types];
  }, [notifications]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-pulse mb-4">
          <img
            src={FreelanstersLogo}
            alt="Freelansters Logo"
            className="h-16 w-16"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg shadow-sm border m-4 border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Notifications
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "All caught up!"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <svg
                className="absolute right-3 top-2.5 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Mark All as Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete All
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {notificationTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeFilter === type
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              {type === "all"
                ? "All"
                : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <svg
            className="h-16 w-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            ></path>
          </svg>
          <p className="text-gray-500 text-center">No notifications found.</p>
          <p className="text-sm text-gray-400 mt-1">
            {activeFilter !== "all"
              ? "Try changing your filter selection."
              : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {filteredNotifications.map((notification) => (
            <li
              key={notification._id}
              className={`p-5 hover:bg-gray-50 transition-colors ${
                !notification.isRead
                  ? "bg-emerald-50/50 border-l-4 border-emerald-500"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium text-gray-900">
                      {notification.title}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full capitalize text-xs font-medium ${
                        notification.type === "info"
                          ? "bg-blue-100 text-blue-800"
                          : notification.type === "success"
                          ? "bg-emerald-100 text-emerald-800"
                          : notification.type === "warning"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {notification.type}
                    </span>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </span>

                    {notification.link && (
                      <a
                        href={notification.link}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        View Details
                      </a>
                    )}

                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {filteredNotifications.length > 0 && (
        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Showing {filteredNotifications.length} of {notifications.length}{" "}
            notifications
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
