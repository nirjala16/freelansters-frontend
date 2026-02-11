import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockIcon, MailIcon } from "lucide-react";
import userApi from "../api";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userApi.post("/admins/login", { email, password });
      console.log(response);
      if (response.data.admin.role === "admin") {
        localStorage.setItem("adminSession", JSON.stringify(response.data));
        toast.success(`Welcome back ${response.data.admin.name}`);
        navigate("/admin/adminpanel");
      } else if (response.data.admin.role !== "admin") {
        toast.error("You are not an admin");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4 rounded-md shadow-sm">
        <div className="relative">
          <MailIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="pl-10 bg-gray-800 text-white border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <LockIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="pl-10 bg-gray-800 text-white border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200"
        >
          Login
        </Button>
      </div>
    </form>
  );
}
