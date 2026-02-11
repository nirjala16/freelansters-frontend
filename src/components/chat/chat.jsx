"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Send,
  Smile,
  MoreVertical,
  Trash2,
  ImageIcon,
  Loader2,
  Info,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from "lucide-react";
import userApi from "../../api";
import EmojiPicker from "./emoji-picker";
import MessageContextMenu from "./message-context-menu";

const Chat = ({ receiverId, user, receiverData }) => {
  const socket = useMemo(
    () => io(import.meta.env.VITE_API_URL, { auth: { token: user.token } }),
    [user.token]
  );

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Group messages by date - messages are already in reverse chronological order from API
  const groupedMessages = useMemo(() => {
    const groups = {};

    messages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      let dateStr;

      if (isToday(date)) {
        dateStr = "Today";
      } else if (isYesterday(date)) {
        dateStr = "Yesterday";
      } else {
        dateStr = format(date, "MMMM d, yyyy");
      }

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }

      groups[dateStr].push(msg);
    });

    // Sort the dates from newest to oldest
    return Object.entries(groups)
      .sort((a, b) => {
        // Special handling for "Today" and "Yesterday"
        if (a[0] === "Today") return -1;
        if (b[0] === "Today") return 1;
        if (a[0] === "Yesterday" && b[0] !== "Today") return -1;
        if (b[0] === "Yesterday" && a[0] !== "Today") return 1;

        // For other dates, compare them as dates
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateB - dateA;
      })
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  }, [messages]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await userApi.get(
          `/chats/chats/${receiverId}/${user.user._id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        if (response.data.success) {
          // Messages are already in reverse chronological order from API
          setMessages(response.data.messages || []);
        } else {
          throw new Error(response.data.message || "Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to load chat history"
        );
      } finally {
        setLoadingMessages(false);
      }
    };

    if (receiverId && user) {
      fetchMessages();
    }
  }, [receiverId, user]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      // Add new message to the beginning since we're displaying newest first
      setMessages((prev) => [data, ...prev]);
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      toast.info("Message was deleted");
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("delete-message", handleMessageDeleted);
    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("delete-message", handleMessageDeleted);
    };
  }, [socket, receiverId]);

  // Handle typing indicators
  useEffect(() => {
    if (!socket || !message.trim()) return;

    const timeout = setTimeout(() => {
      socket.emit("typing", { receiverId });
    }, 500);

    return () => clearTimeout(timeout);
  }, [message, socket, receiverId]);

  // Scroll to top when new messages are added (since newest messages are at the top)
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle WebSocket errors
  useEffect(() => {
    if (!socket) return;

    const handleDisconnect = () => {
      toast.error("Disconnected from the server. Attempting to reconnect...");
    };

    const handleConnectError = (error) => {
      console.error("Connection error:", error.message);
      toast.error("Failed to connect to the server");
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu]);

  // Send message
  const sendMessage = async (e) => {
    e?.preventDefault();

    const messageContent = message.trim();
    if (!messageContent) return;

    const MAX_MESSAGE_LENGTH = 2000;
    if (messageContent.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message exceeds ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    setLoading(true);
    try {
      const messageData = {
        receiverId,
        message: messageContent,
      };
      // Send new message
      socket.emit("send-message", messageData);

      // Optimistically update UI - add to beginning for newest first
      const newMessage = {
        _id: Date.now().toString(),
        message: messageContent,
        senderId: user.user._id,
        receiverId: receiverId,
        createdAt: new Date().toISOString(),
        messageType: "text",
      };

      setMessages((prev) => [newMessage, ...prev]);

      // Reset states
      setMessage("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle message context menu
  const handleContextMenu = (e, messageId) => {
    e.preventDefault();
    const rect = chatContainerRef.current.getBoundingClientRect();

    setContextMenu({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      messageId,
    });
  };

  // Handle message actions
  const handleCopyMessage = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Message copied to clipboard"))
      .catch(() => toast.error("Failed to copy message"));

    setContextMenu({ ...contextMenu, visible: false });
  };

  // Trigger delete dialog for a specific message
  const handleDeleteMessage = (messageId) => {
    setMessageToDelete(messageId);
    socket.emit("delete-message", { messageId });
    setShowDeleteDialog(true);
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Handle delete message confirmation
  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    toast.success("Message deleted successfully.");
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return format(date, "h:mm a");
  };

  // Render message status indicator
  const MessageStatus = ({ message }) => {
    if (message.pending) {
      return <Clock className="h-3 w-3 text-muted-foreground ml-1" />;
    } else if (message.isRead) {
      return <CheckCircle2 className="h-3 w-3 text-green-500 ml-1" />;
    } else {
      return <CheckCircle2 className="h-3 w-3 text-muted-foreground ml-1" />;
    }
  };

  return (
    <Card className="w-full shadow-lg border-muted/30 overflow-hidden">
      <CardHeader className="border-b bg-muted/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Avatar className="h-10 w-10 border">
              <AvatarImage
                src={receiverData?.profilePic}
                alt={receiverData?.name || "User"}
              />
              <AvatarFallback>
                {receiverData?.name?.[0] || receiverId[0]}
              </AvatarFallback>
            </Avatar>

            <div>
              <CardTitle className="text-base font-medium">
                {receiverData?.name || receiverId}
              </CardTitle>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Info className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Media & Files
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className="p-0 h-[calc(100vh-16rem)] flex flex-col"
        ref={chatContainerRef}
      >
        <ScrollArea className="flex-1 p-4">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">
                  Loading messages...
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="bg-muted/20 p-6 rounded-full mb-4">
                <Send className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Send a message to start the conversation with{" "}
                {receiverData?.name || "this user"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Reference for scrolling to newest message (top) */}
              <div ref={messagesEndRef} />

              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-xs text-muted-foreground">
                      {date}
                    </span>
                    <div className="flex-grow border-t border-muted"></div>
                  </div>

                  <div className="space-y-3">
                    {dateMessages.map((msg) => {
                      const isOwnMessage = msg.senderId === user.user._id;

                      return (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                          onContextMenu={(e) => handleContextMenu(e, msg._id)}
                        >
                          <div
                            className={`max-w-[75%] ${
                              isOwnMessage ? "order-1" : "order-2"
                            }`}
                          >
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/30 text-foreground"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>

                              <div
                                className={`flex items-center text-xs mt-1 ${
                                  isOwnMessage ? "justify-end" : "justify-start"
                                }`}
                              >
                                <span
                                  className={
                                    isOwnMessage
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {formatMessageTime(msg.createdAt)}
                                </span>

                                {isOwnMessage && (
                                  <MessageStatus message={msg} />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Context menu for right-click */}
                          {contextMenu.visible &&
                            contextMenu.messageId === msg._id && (
                              <MessageContextMenu
                                x={contextMenu.x}
                                y={contextMenu.y}
                                message={msg}
                                isOwnMessage={isOwnMessage}
                                onCopy={() => handleCopyMessage(msg.message)}
                                onDelete={
                                  isOwnMessage
                                    ? () => handleDeleteMessage(msg._id)
                                    : null
                                }
                              />
                            )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Message input */}
        <div className="p-4 border-t">
          <form onSubmit={sendMessage} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="min-h-[40px] max-h-[120px] pr-10 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <div className="absolute right-2 bottom-2 flex items-center">
                <Popover
                  open={showEmojiPicker}
                  onOpenChange={setShowEmojiPicker}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      type="button"
                    >
                      <Smile className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="end">
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button
              type="submit"
              size="icon"
              disabled={loading || !message.trim()}
              className="h-10 w-10 rounded-full"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>

      {/* Delete message confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMessage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

Chat.propTypes = {
  receiverId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    token: PropTypes.string.isRequired,
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      email: PropTypes.string,
    }).isRequired,
  }).isRequired,
  receiverData: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    profilePic: PropTypes.string,
  }),
  message: PropTypes.string,
};

export default Chat;
