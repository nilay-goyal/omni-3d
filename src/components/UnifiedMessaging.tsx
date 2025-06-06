
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  listing_id: string | null;
  listing_title: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: {
    full_name: string;
  } | null;
}

const UnifiedMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation && user) {
      fetchMessages(selectedConversation.participant_id, selectedConversation.listing_id);
    }
  }, [selectedConversation, user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Fetch all messages where user is sender or receiver
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          listing:marketplace_listings(title)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Get all unique participant IDs
      const participantIds = [...new Set(
        messagesData?.map(msg => 
          msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        ) || []
      )];

      // Fetch participant profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', participantIds);

      if (profilesError) throw profilesError;

      // Group messages by conversation and create conversation objects
      const conversationMap = new Map<string, Conversation>();

      messagesData?.forEach(message => {
        const participantId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const conversationKey = `${participantId}-${message.listing_id || 'general'}`;
        
        if (!conversationMap.has(conversationKey)) {
          const participant = profilesData?.find(p => p.id === participantId);
          conversationMap.set(conversationKey, {
            id: conversationKey,
            participant_id: participantId,
            participant_name: participant?.full_name || 'Unknown User',
            listing_id: message.listing_id,
            listing_title: (message as any).listing?.title || null,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0
          });
        }
      });

      // Calculate unread counts
      for (const conversation of conversationMap.values()) {
        const unreadMessages = messagesData?.filter(msg =>
          msg.receiver_id === user.id &&
          !msg.is_read &&
          (msg.sender_id === conversation.participant_id) &&
          (msg.listing_id === conversation.listing_id)
        ) || [];
        conversation.unread_count = unreadMessages.length;
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async (participantId: string, listingId: string | null) => {
    if (!user) return;

    try {
      // Fetch messages between user and participant for specific listing
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${user.id})`)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch sender profiles
      const senderIds = [...new Set(messagesData?.map(msg => msg.sender_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', senderIds);

      if (profilesError) throw profilesError;

      // Combine messages with sender information
      const messagesWithSenders = messagesData?.map(message => ({
        ...message,
        sender: profilesData?.find(profile => profile.id === message.sender_id) || null
      })) || [];

      setMessages(messagesWithSenders);

      // Mark messages as read
      const unreadMessages = messagesWithSenders.filter(msg => msg.receiver_id === user.id && !msg.is_read);
      if (unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessages.map(msg => msg.id));
        
        // Refresh conversations to update unread counts
        fetchConversations();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversation) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation.participant_id,
          listing_id: selectedConversation.listing_id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages(selectedConversation.participant_id, selectedConversation.listing_id);
      fetchConversations();
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{conversation.participant_name}</h4>
                      {conversation.listing_title && (
                        <p className="text-xs text-gray-600 mb-1">{conversation.listing_title}</p>
                      )}
                      <p className="text-xs text-gray-500 truncate">{conversation.last_message}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.last_message_time)}
                      </span>
                      {conversation.unread_count > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 mt-1">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Panel */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">{selectedConversation.participant_name}</CardTitle>
              {selectedConversation.listing_title && (
                <p className="text-sm text-gray-600">{selectedConversation.listing_title}</p>
              )}
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[500px]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === user?.id;
                    const showDate = index === 0 || 
                      formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="text-center text-xs text-gray-500 my-2">
                            {formatDate(message.created_at)}
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] px-3 py-2 rounded-lg ${
                              isCurrentUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || loading}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-[500px]">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default UnifiedMessaging;
