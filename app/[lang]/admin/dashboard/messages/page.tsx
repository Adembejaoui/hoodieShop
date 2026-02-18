"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  cn,
} from "@/lib/utils";
import {
  MessageSquare,
  Mail,
  Send,
  MoreHorizontal,
  Trash2,
  Reply,
} from "lucide-react";
import { formatDate } from "@/lib/dashboard-utils";

// Types
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MessagesPage() {
  const t = useTranslations("admin");
  
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/admin/contact");
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      const response = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          reply: replyText,
        }),
      });

      if (response.ok) {
        setSelectedMessage(null);
        setReplyText("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm(t("confirmDeleteMessage"))) return;

    try {
      const response = await fetch(`/api/admin/contact?id=${messageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleUpdateMessageStatus = async (messageId: string, status: string) => {
    try {
      const response = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          status,
        }),
      });

      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("contactMessages")}</h2>
        <Badge variant="outline">
          {messages.length} {t("messagesCount", { count: messages.length })}
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("noMessages")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{message.name}</CardTitle>
                    <CardDescription>{message.email}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        message.status === "NEW" && "bg-blue-500",
                        message.status === "READ" && "bg-gray-500",
                        message.status === "REPLIED" && "bg-green-500",
                        message.status === "CLOSED" && "bg-red-500"
                      )}
                    >
                      {message.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateMessageStatus(message.id, "READ")}>
                          {t("markAsRead")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateMessageStatus(message.id, "REPLIED")}>
                          {t("markAsReplied")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateMessageStatus(message.id, "CLOSED")}>
                          {t("close")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">{t("subject")}</p>
                  <p className="text-sm text-muted-foreground">{message.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t("message")}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message.message}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{t("received")}: {formatDate(message.createdAt)}</span>
                  {message.updatedAt !== message.createdAt && (
                    <span>{t("lastUpdated")}: {formatDate(message.updatedAt)}</span>
                  )}
                </div>

                {/* Reply Section */}
                {selectedMessage?.id === message.id ? (
                  <div className="space-y-3 pt-4 border-t">
                    <Textarea
                      placeholder={t("typeYourReply")}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedMessage(null);
                          setReplyText("");
                        }}
                      >
                        {t("cancel")}
                      </Button>
                      <Button onClick={() => handleSendReply()}>
                        <Send className="w-4 h-4 mr-2" />
                        {t("sendReply")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedMessage(message);
                      setReplyText("");
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {t("reply")}
                  </Button>
                )}

                {/* Show existing reply if any */}
                {message.reply && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="w-4 h-4" />
                      <span className="text-sm font-medium">{t("yourReply")}</span>
                      {message.repliedAt && (
                        <span className="text-xs text-muted-foreground">
                          ({formatDate(message.repliedAt)})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded">
                      {message.reply}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}