"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import userApi from "../../api";

const ProjectChat = ({ projectId, user, projectData }) => {
  const socket = useMemo(
    () => io(import.meta.env.VITE_API_URL, { auth: { token: user.token } }),
    [user.token]
  );

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await userApi.get(
          `/projectChats/messages/${projectId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        if (response.data.success) {
          setMessages(response.data.messages || []);
        } else {
          throw new Error(response.data.message || "Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load chat history");
      } finally {
        setLoadingMessages(false);
      }
    };

    if (projectId && user) {
      fetchMessages();
    }
  }, [projectId, user]);

  // Join the project room
  useEffect(() => {
    if (socket && projectId) {
      socket.emit("join-project-room", { projectId });
    }
  }, [socket, projectId]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]); // Add new message to the end
    };

    socket.on("receive-project-message", handleReceiveMessage);

    return () => {
      socket.off("receive-project-message", handleReceiveMessage);
    };
  }, [socket]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();

    const messageContent = message.trim();
    if (!messageContent) return;

    setLoading(true);
    try {
      const messageData = {
        projectId,
        message: messageContent,
      };

      // Emit the message to the server
      socket.emit("send-project-message", messageData);

      // Optimistically update UI
      const newMessage = {
        _id: Date.now().toString(),
        message: messageContent,
        senderId: user.user._id,
        projectId,
        createdAt: new Date().toISOString(),
        messageType: "text",
      };

      setMessages((prev) => [...prev, newMessage]); // Add new message to the end
      setMessage(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 overflow-hidden">
      <CardHeader className="border-b bg-muted/10 px-4 py-3">
        <CardTitle className="text-base font-medium">
          {projectData?.job?.title || "Project Chat"}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100vh-16rem)] flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.senderId === user.user._id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg ${
                    msg.senderId === user.user._id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-foreground"
                  }`}
                >
                  <p>{msg.message}</p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 resize-none"
          />
          <Button
            type="submit"
            disabled={loading || !message.trim()}
            className="h-10 w-10"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

ProjectChat.propTypes = {
  projectId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    token: PropTypes.string.isRequired,
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  projectData: PropTypes.object,
};

export default ProjectChat;