import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSTLFile } from "@/contexts/STLFileContext";

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

interface SaleConfirmation {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  seller_confirmed: boolean;
  buyer_confirmed: boolean;
  sale_completed: boolean;
  seller_confirmed_at: string | null;
  buyer_confirmed_at: string | null;
  sale_completed_at: string | null;
}

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerId: string;
  sellerName: string;
  listingId: string | null;
  listingTitle: string;
}

const ChatModal = ({ open, onOpenChange, sellerId, sellerName, listingId, listingTitle }: ChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasInitialMessage, setHasInitialMessage] = useState(false);
  const [saleConfirmation, setSaleConfirmation] = useState<SaleConfirmation | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { stlFile } = useSTLFile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open && user && sellerId) {
      fetchMessages();
      fetchSaleConfirmation();
    }
  }, [open, user, sellerId, listingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      // Use Promise.all to fetch messages and profiles in parallel
      const messagesQuery = supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${sellerId}),and(sender_id.eq.${sellerId},receiver_id.eq.${user.id})`);
      
      // Apply listing_id filter based on whether it's null or has a value
      const messagesWithListingFilter = listingId 
        ? messagesQuery.eq('listing_id', listingId)
        : messagesQuery.is('listing_id', null);

      const [messagesResponse, profilesResponse] = await Promise.all([
        messagesWithListingFilter.order('created_at', { ascending: true }),
        
        // Fetch both user profiles at once
        supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', [user.id, sellerId])
      ]);

      if (messagesResponse.error) throw messagesResponse.error;
      if (profilesResponse.error) throw profilesResponse.error;

      // Create profile lookup map for faster access
      const profileMap = new Map(
        profilesResponse.data?.map(profile => [profile.id, profile]) || []
      );

      // Combine messages with sender information
      const messagesWithSenders = messagesResponse.data?.map(message => ({
        ...message,
        sender: profileMap.get(message.sender_id) || { full_name: 'Unknown User' }
      })) || [];

      setMessages(messagesWithSenders);
      setHasInitialMessage(messagesWithSenders.length > 0);

      // If no messages exist, send the initial "Hi, I am interested." message
      if (messagesWithSenders.length === 0) {
        await sendInitialMessage();
      }

      // Mark messages as read (batch update)
      const unreadMessages = messagesWithSenders.filter(msg => msg.receiver_id === user.id && !msg.is_read);
      if (unreadMessages.length > 0) {
        // Fire and forget - don't await, use async operation
        const markAsRead = async () => {
          try {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .in('id', unreadMessages.map(msg => msg.id));
          } catch (err) {
            console.error('Error marking messages as read:', err);
          }
        };
        markAsRead();
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

  const fetchSaleConfirmation = async () => {
    if (!user || !listingId) return;

    try {
      const { data, error } = await supabase
        .from('sale_confirmations')
        .select('*')
        .eq('listing_id', listingId)
        .or(`and(buyer_id.eq.${user.id},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${user.id})`)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      setSaleConfirmation(data);
    } catch (error) {
      console.error('Error fetching sale confirmation:', error);
    }
  };

  const createOrUpdateSaleConfirmation = async (action: 'seller_confirm' | 'buyer_confirm') => {
    if (!user || !listingId) return;

    try {
      setLoading(true);
      const isSeller = profile?.user_type === 'seller';
      const buyerId = isSeller ? sellerId : user.id;
      const actualSellerId = isSeller ? user.id : sellerId;

      if (!saleConfirmation) {
        // Create new sale confirmation
        const { data, error } = await supabase
          .from('sale_confirmations')
          .insert({
            listing_id: listingId,
            buyer_id: buyerId,
            seller_id: actualSellerId,
            seller_confirmed: action === 'seller_confirm',
            buyer_confirmed: action === 'buyer_confirm',
            seller_confirmed_at: action === 'seller_confirm' ? new Date().toISOString() : null,
            buyer_confirmed_at: action === 'buyer_confirm' ? new Date().toISOString() : null
          })
          .select()
          .single();

        if (error) throw error;
        setSaleConfirmation(data);
      } else {
        // Update existing sale confirmation
        const updates: any = {};
        if (action === 'seller_confirm') {
          updates.seller_confirmed = true;
          updates.seller_confirmed_at = new Date().toISOString();
        } else {
          updates.buyer_confirmed = true;
          updates.buyer_confirmed_at = new Date().toISOString();
        }

        // Check if both parties have confirmed
        const bothConfirmed = (action === 'seller_confirm' && saleConfirmation.buyer_confirmed) || 
                             (action === 'buyer_confirm' && saleConfirmation.seller_confirmed);
        
        if (bothConfirmed) {
          updates.sale_completed = true;
          updates.sale_completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from('sale_confirmations')
          .update(updates)
          .eq('id', saleConfirmation.id)
          .select()
          .single();

        if (error) throw error;
        setSaleConfirmation(data);

        // Send completion message if sale is completed
        if (bothConfirmed) {
          await sendCompletionMessage();
        }
      }

      const actionText = action === 'seller_confirm' ? 'confirmed to print' : 'confirmed purchase';
      toast({
        title: "Confirmation sent",
        description: `You have ${actionText} this item.`,
      });

      fetchSaleConfirmation();
    } catch (error) {
      console.error('Error updating sale confirmation:', error);
      toast({
        title: "Error",
        description: "Failed to update confirmation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendCompletionMessage = async () => {
    try {
      const completionMessage = "🎉 Sale Confirmed! Both parties have agreed to proceed with this transaction. The seller will begin printing and you can coordinate delivery details.";
      
      await supabase
        .from('messages')
        .insert({
          sender_id: user!.id,
          receiver_id: sellerId,
          listing_id: listingId,
          content: completionMessage
        });

      fetchMessages();
    } catch (error) {
      console.error('Error sending completion message:', error);
    }
  };

  const sendInitialMessage = async () => {
    if (!user || hasInitialMessage) return;

    try {
      let content = "Hi, I am interested.";
      
      // If user has an STL file uploaded, include it in the initial message
      if (stlFile) {
        content = `Hi, I am interested in getting a quote for my 3D print. I have uploaded an STL file: ${stlFile.fileName}. Please let me know your pricing and timeline.`;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: sellerId,
          listing_id: listingId,
          content: content
        });

      if (error) throw error;
      setHasInitialMessage(true);
      
      // Create sale confirmation record if this is a buyer and one doesn't exist
      if (profile?.user_type === 'buyer' && listingId && !saleConfirmation) {
        try {
          await supabase
            .from('sale_confirmations')
            .insert({
              listing_id: listingId,
              buyer_id: user.id,
              seller_id: sellerId,
              seller_confirmed: false,
              buyer_confirmed: false,
              sale_completed: false
            });
          fetchSaleConfirmation();
        } catch (confirmationError) {
          console.error('Error creating sale confirmation:', confirmationError);
        }
      }
      
      // Refresh messages to show the new one
      setTimeout(fetchMessages, 500);
    } catch (error) {
      console.error('Error sending initial message:', error);
    }
  };

  const sendSTLFile = async () => {
    if (!stlFile || !user) return;

    try {
      setLoading(true);
      
      // Get a signed URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from('stl-files')
        .createSignedUrl(stlFile.uploadedPath!, 3600); // 1 hour expiry

      const fileMessage = `📁 STL File Shared: ${stlFile.fileName}\n\nDownload link: ${urlData?.signedUrl || 'File sharing not available'}\n\nThis link will expire in 1 hour. Please download the file to review for your quote.`;

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: sellerId,
          listing_id: listingId,
          content: fileMessage
        });

      if (error) throw error;

      fetchMessages();
      
      toast({
        title: "STL file shared",
        description: "Your STL file has been shared with the seller.",
      });
    } catch (error) {
      console.error('Error sharing STL file:', error);
      toast({
        title: "Error",
        description: "Failed to share STL file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: sellerId,
          listing_id: listingId,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages();
      
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{sellerName}</DialogTitle>
              <p className="text-sm text-gray-600 truncate">{listingTitle}</p>
            </div>
          </div>
        </DialogHeader>

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
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          {/* Sale Confirmation Section */}
          {listingId && saleConfirmation && !saleConfirmation.sale_completed && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-900">Sale Confirmation</p>
                
                {profile?.user_type === 'seller' && !saleConfirmation.seller_confirmed && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-green-700">Ready to print this item?</p>
                    <Button
                      onClick={() => createOrUpdateSaleConfirmation('seller_confirm')}
                      disabled={loading}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Confirm to Print
                    </Button>
                  </div>
                )}
                
                {profile?.user_type === 'buyer' && saleConfirmation.seller_confirmed && !saleConfirmation.buyer_confirmed && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-green-700">Seller is ready to print. Confirm purchase?</p>
                    <Button
                      onClick={() => createOrUpdateSaleConfirmation('buyer_confirm')}
                      disabled={loading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Confirm Purchase
                    </Button>
                  </div>
                )}
                
                {saleConfirmation.seller_confirmed && saleConfirmation.buyer_confirmed && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-800">🎉 Sale Confirmed!</p>
                    <p className="text-xs text-green-600">Both parties have agreed to proceed</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {stlFile && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">STL File Ready</p>
                  <p className="text-xs text-blue-700">{stlFile.fileName}</p>
                </div>
                <Button
                  onClick={sendSTLFile}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  <Paperclip className="h-4 w-4 mr-1" />
                  Share File
                </Button>
              </div>
            </div>
          )}
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
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
