import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Send, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface ChatPartner {
  first_name: string;
  last_name: string;
}

const Chat = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [partner, setPartner] = useState<ChatPartner | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!partnerId) return;
    // Fetch partner info
    supabase.from("profiles").select("first_name, last_name").eq("user_id", partnerId).single()
      .then(({ data }) => { if (data) setPartner(data); });
  }, [partnerId]);

  useEffect(() => {
    if (!user || !partnerId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    // Mark unread messages as read
    supabase.from("messages")
      .update({ read: true })
      .eq("sender_id", partnerId)
      .eq("receiver_id", user.id)
      .eq("read", false)
      .then(() => {});

    // Poll for new messages every 3 seconds
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
      
      // Mark unread as read
      await supabase.from("messages")
        .update({ read: true })
        .eq("sender_id", partnerId)
        .eq("receiver_id", user.id)
        .eq("read", false);
    }, 3000);

    return () => { clearInterval(interval); };
  }, [user, partnerId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !partnerId) return;
    setSending(true);
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: partnerId,
      content: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center gap-3 h-16">
          <Link to={-1 as any} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-9 h-9 rounded-full gradient-wave flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {partner ? partner.first_name.charAt(0) : "?"}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">
              {partner ? `${partner.first_name} ${partner.last_name}` : "Loading..."}
            </h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-12">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.sender_id === user?.id
                ? "gradient-ocean text-primary-foreground rounded-br-md"
                : "bg-card border border-border text-foreground rounded-bl-md"
            }`}>
              {msg.content}
              <div className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border p-4">
        <form onSubmit={sendMessage} className="container flex gap-2">
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
          />
          <button type="submit" disabled={sending || !newMessage.trim()}
            className="gradient-ocean text-primary-foreground p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

