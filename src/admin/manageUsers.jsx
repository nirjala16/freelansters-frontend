import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import userApi from "../api";
import { UsersIcon, SearchIcon, BanIcon, TrashIcon } from "lucide-react";
import { useNavigate } from "react-router";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("adminSession"));

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userApi.get("/admins/manageusers", {
        headers: {
          Authorization: `Bearer ${admin?.token}`,
          "Content-Type": "application/json",
        },
      });
      setUsers(response.data.users);
      console.log(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [admin?.token]);

  const handleBanUnban = async (userId) => {
    toast.success(`User status updated. User ID: ${userId}`);
  };

  const handleDelete = async (userId) => {
    if (
      !window.confirm("Are you sure you want to delete this user permanently?")
    )
      return;

    try {
      await userApi.delete(`/admins/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${admin?.token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user.", error);
    }
  };

  const handleProfileClick = (clientId) => {
    navigate(`/userProfile/${clientId}`);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold">Manage Users</h1>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users"
              className="pl-10 pr-4 py-2 w-64 rounded-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <UsersIcon className="animate-pulse h-8 w-8 text-blue-500" />
          </div>
        ) : (
          <div className="shadow-sm rounded-lg overflow-hidden border">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y bg-background">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-muted transition-colors duration-150 ease-in-out"
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium cursor-pointer"
                      onClick={() => handleProfileClick(user._id)}
                    >
                      <Avatar className="h-8 w-8 border-muted-foreground hover:border-2">
                        <AvatarImage
                          src={user?.profilePic}
                          alt="user profile picture"
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {user ? user.name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>{" "}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm  capitalize">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isBanned
                            ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                            : "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        }`}
                      >
                        {user.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBanUnban(user._id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 mr-2"
                      >
                        <BanIcon className="h-4 w-4" />
                        <span className="sr-only">
                          {user.isBanned ? "Unban" : "Ban"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
