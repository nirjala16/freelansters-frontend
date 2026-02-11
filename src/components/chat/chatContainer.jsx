import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Chat from "./chat";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import userApi from "../../api";

const ChatContainer = () => {
  const navigate = useNavigate();
  const { userId: receiverId } = useParams();
  const [user, setUser] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedSession = localStorage.getItem("session");

        if (!storedSession) {
          setError(true);
          setErrorMessage("Please log in to access chat");
          toast.error("Please log in to access chat");
          navigate("/login");
          return;
        }

        const parsedUser = JSON.parse(storedSession);
        setUser(parsedUser);
        // Fetch receiver details

        try {
          const response = await userApi.get(`/users/${receiverId}`, {
            headers: { Authorization: `Bearer ${parsedUser.token}` },
          });
          if (response.data && response.data.user) {
            setReceiver(response.data.user);
          } else {
            setError(true);
            setErrorMessage("Receiver not found.");
            toast.error("Receiver not found.");
          }
        } catch (err) {
          console.error("Error fetching receiver details:", err);
          toast.error("Error fetching receiver details:", err);
          // Continue even if we can't fetch receiver details
        }
      } catch (err) {
        console.error("Authentication error:", err);
        setError(true);
        setErrorMessage("Authentication error. Please try again.");
        toast.error("Authentication error. Please try again.");
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [navigate, receiverId]);

  if (loading) {
    return <ChatContainerSkeleton />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto mt-8 p-4"
      >
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Chat</h2>
            <p className="text-muted-foreground mb-4">
              {errorMessage || "An error occurred. Please try again."}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Login
            </button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return user ? (
    <AnimatePresence mode="wait">
      <motion.div
        key="chat"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto p-4"
      >
        <Chat user={user} receiverId={receiverId} receiverData={receiver} />
      </motion.div>
    </AnimatePresence>
  ) : null;
};

const ChatContainerSkeleton = () => (
  <div className="max-w-4xl mx-auto p-4">
    <Card>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[120px]" />
            </div>
          </div>
        </div>
        <div className="p-4 h-[400px] flex flex-col justify-end">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`flex ${
                  i % 2 === 0 ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    i % 2 === 0 ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <Skeleton className={`h-16 w-full rounded-lg`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="flex items-center justify-center mt-4 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      <span className="text-sm">Loading conversation...</span>
    </div>
  </div>
);

export default ChatContainer;