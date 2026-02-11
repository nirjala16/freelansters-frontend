import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "../../api";
import { useNavigate } from "react-router";
import { DangerZone } from "./DangerZone";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats ";
import { ProfileForm } from "./ProfileForm ";
import { SkillsAndPortfolio } from "./SkillsAndPortfolio ";
import { ChangePassword } from "./pswChange";

export default function Profile() {
  const [userData, setUserData] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phoneNumber: "",
    location: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const user = useRef(JSON.parse(localStorage.getItem("session")));
  const isMounted = useRef(true);

  useEffect(() => {
    if (!user.current) {
      toast.error("Invalid user session. Please log in.");
      navigate("/");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await api.get(
          `/users/allUser/${user.current.user.email}`,
          {
            headers: {
              Authorization: `Bearer ${user.current.token}`,
            },
          }
        );
        if (isMounted.current) {
          const data = response.data.user;
          setUserData({
            ...data,
            memberSince: data.createdAt
              ? new Date(data.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                })
              : "Loading...",
          });

          setFormData({
            name: data.name || "",
            bio: data.bio || "",
            location: data.location || "",
            phoneNumber: data.phoneNumber ? String(data.phoneNumber) : "",
          });
          isMounted.current = false;
          setIsFetching(false); // Ensure this is set to false after data is fetched
        }
      } catch (error) {
        console.error("Error fetching profile data:", error.message);
        toast.error("Failed to fetch profile data. " + error.message);
        setIsFetching(false); // Ensure this is set to false even if there's an error
      }
    };

    fetchProfileData();
  }, [isFetching, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e) => {
    const userProfilePic = e.target.files[0];
    if (!userProfilePic) {
      toast.error("Please upload a profile picture");
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.append("file", userProfilePic);
    data.append("upload_preset", "freelansters");
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const uploadImageUrl = await res.json();
      await handleProfilePicSubmit(uploadImageUrl.url);

      setUserData((prev) => ({
        ...prev,
        profilePic: uploadImageUrl.url,
      }));
    } catch (error) {
      toast.error("Error uploading profile picture");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put(
        `/users/${user.current.user._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.current.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      console.log(formData);
      if (response.data.success) {
        setUserData((prev) => ({
          ...prev,
          ...formData,
        }));
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      toast.error("Error updating profile. " + error.response?.data?.message);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: userData.name,
      bio: userData.bio,
      phoneNumber: userData.phoneNumber,
    });
    setIsEditing(false);
  };

  const handleProfilePicSubmit = async (newProfilePic) => {
    try {
      const response = await api.put(
        `/users/${user.current.user._id}`,
        { profilePic: newProfilePic },
        {
          headers: {
            Authorization: `Bearer ${user.current.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Profile picture updated successfully!");
      }
    } catch (error) {
      toast.error("Error updating profile picture.");
      console.error(error);
      throw error;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await api.delete(`/users/${user.current.user._id}`, {
        headers: {
          Authorization: `Bearer ${user.current.token}`,
        },
      });

      if (response.data.success) {
        toast.success("Account deleted successfully");
        localStorage.removeItem("session");
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(
        "Error deleting account. " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  if (isFetching) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto p-6">
      <ProfileHeader
        userData={userData}
        isUploading={isUploading}
        handleFileChange={handleFileChange}
      />
      <ProfileStats userData={userData} />
      <Tabs defaultValue="profile" className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleCancelEdit={handleCancelEdit}
            setIsEditing={setIsEditing}
            isEditing={isEditing}
          />
          <SkillsAndPortfolio userData={userData} />
        </TabsContent>
        <TabsContent value="security">
          <ChangePassword
            userId={user.current.user._id}
            token={user.current.token}
          />
        </TabsContent>
        <TabsContent value="danger">
          <DangerZone handleDeleteAccount={handleDeleteAccount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Card className="w-full overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900" />
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col lg:flex-row items-center lg:items-end lg:space-x-8">
                <div className="-mt-24 relative z-10">
                  <Skeleton className="w-48 h-48 rounded-full" />
                </div>
                <div className="mt-6 lg:mt-0 text-center lg:text-left flex-1">
                  <Skeleton className="h-8 w-48 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Skeleton className="h-10 w-[600px]" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
