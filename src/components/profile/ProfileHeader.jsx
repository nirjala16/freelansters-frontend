import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, Mail, Phone, Calendar, MapPin } from "lucide-react";

export function ProfileHeader({ userData, isUploading, handleFileChange }) {
  return (
    <div className="relative w-full backdrop-blur-xl overflow-hidden rounded-xl bg-gradient-to-r dark:bg-gradient-to-r from-primary/10 via-primary/5 to-background border">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center blur-lg opacity-50"
        style={{
          backgroundImage: `url(${userData.profilePic})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/50 to-background/80 z-10" />

      <div className="relative px-6 py-10 sm:px-10 sm:py-16 z-20">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          {/* Avatar Section */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-background shadow-xl">
              <AvatarImage
                src={userData.profilePic}
                alt={userData.name}
                className="object-cover"
              />
              <AvatarFallback className="text-4xl">
                {userData.name ? userData.name[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-2 right-2 cursor-pointer"
            >
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full shadow-lg h-8 w-8"
                disabled={isUploading}
                onClick={() => {
                  document.getElementById("avatar-upload").click();
                }}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
            </label>
          </motion.div>

          {/* User Details Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex-1 text-center sm:text-left space-y-4"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {userData.name}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge variant="secondary" className="capitalize">
                  {userData.role}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-background/50 backdrop-blur-sm"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {userData.location || "Remote"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {userData.email}
              </div>
              {userData.phoneNumber && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {userData.phoneNumber}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Member since {userData.memberSince}
              </div>
            </div>

            {userData.bio && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl text-sm text-muted-foreground"
              >
                {userData.bio}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

ProfileHeader.propTypes = {
  userData: PropTypes.shape({
    profilePic: PropTypes.string,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    memberSince: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phoneNumber: PropTypes.number,
    bio: PropTypes.string,
    location: PropTypes.string,
  }).isRequired,
  isUploading: PropTypes.bool.isRequired,
  handleFileChange: PropTypes.func.isRequired,
};