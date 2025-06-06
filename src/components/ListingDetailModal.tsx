
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Eye, Edit, Calendar, Package, Clock, Ruler, Weight, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ChatModal from "./ChatModal";

interface ListingDetailModalProps {
  listingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  material: string;
  dimensions: string;
  weight_grams: number;
  print_time_hours: number;
  location_city: string;
  location_state: string;
  views_count: number;
  created_at: string;
  is_active: boolean;
  seller_id: string;
  images: {
    image_url: string;
    is_primary: boolean;
    alt_text: string;
  }[];
  seller: {
    full_name: string;
  } | null;
  category: {
    name: string;
  } | null;
}

const ListingDetailModal = ({ listingId, open, onOpenChange }: ListingDetailModalProps) => {
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (listingId && open) {
      fetchListingDetail();
    }
  }, [listingId, open]);

  const fetchListingDetail = async () => {
    if (!listingId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          images:marketplace_images(image_url, is_primary, alt_text),
          seller:profiles!seller_id(full_name),
          category:marketplace_categories(name)
        `)
        .eq('id', listingId)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing detail:', error);
      toast({
        title: "Error",
        description: "Failed to load listing details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (images: any[]) => {
    const primaryImage = images?.find(img => img.is_primary);
    return primaryImage?.image_url || images?.[0]?.image_url || '/placeholder.svg';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(price);
  };

  const handleEditClick = () => {
    if (listing) {
      onOpenChange(false);
      navigate(`/edit-listing/${listing.id}`);
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact the seller.",
        variant: "destructive"
      });
      return;
    }
    
    setChatOpen(true);
  };

  const isOwnListing = user && listing && user.id === listing.seller_id;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!listing) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{listing.title}</DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Section */}
              <div className="space-y-4">
                {listing.images && listing.images.length > 0 ? (
                  listing.images.length === 1 ? (
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={listing.images[0].image_url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Carousel className="w-full h-full">
                        <CarouselContent>
                          {listing.images.map((image, index) => (
                            <CarouselItem key={index}>
                              <img
                                src={image.image_url}
                                alt={image.alt_text || `Image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {listing.images.length > 1 && (
                          <>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                          </>
                        )}
                      </Carousel>
                    </div>
                  )
                ) : (
                  <div className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                
                {listing.images && listing.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {listing.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="aspect-square rounded border overflow-hidden">
                        <img
                          src={image.image_url}
                          alt={image.alt_text || `Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                {/* Price and Status */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(listing.price)}
                  </span>
                  <div className="flex items-center space-x-2">
                    {isOwnListing && (
                      <Badge variant={listing.is_active ? "default" : "secondary"}>
                        {listing.is_active ? "Published" : "Draft"}
                      </Badge>
                    )}
                    <Badge variant="outline">{listing.condition}</Badge>
                  </div>
                </div>

                {/* Location and Views */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location_city}, {listing.location_state}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {listing.views_count} views
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
                </div>

                <Separator />

                {/* 3D Printing Details */}
                <div>
                  <h3 className="font-semibold mb-3">3D Printing Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {listing.material && (
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Material:</span>
                        <span className="ml-1 font-medium">{listing.material}</span>
                      </div>
                    )}
                    
                    {listing.dimensions && (
                      <div className="flex items-center">
                        <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="ml-1 font-medium">{listing.dimensions}</span>
                      </div>
                    )}
                    
                    {listing.weight_grams && (
                      <div className="flex items-center">
                        <Weight className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Weight:</span>
                        <span className="ml-1 font-medium">{listing.weight_grams}g</span>
                      </div>
                    )}
                    
                    {listing.print_time_hours && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Print Time:</span>
                        <span className="ml-1 font-medium">{listing.print_time_hours}h</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Additional Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  {listing.category && (
                    <div>
                      <span className="font-medium">Category:</span> {listing.category.name}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Listed on {new Date(listing.created_at).toLocaleDateString()}
                  </div>
                  {listing.seller && (
                    <div>
                      <span className="font-medium">Seller:</span> {listing.seller.full_name}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {isOwnListing ? (
                  <Button 
                    onClick={handleEditClick}
                    className="w-full"
                    size="lg"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Listing
                  </Button>
                ) : (
                  <Button 
                    onClick={handleContactSeller}
                    className="w-full"
                    size="lg"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      {listing && !isOwnListing && (
        <ChatModal
          open={chatOpen}
          onOpenChange={setChatOpen}
          sellerId={listing.seller_id}
          sellerName={listing.seller?.full_name || 'Seller'}
          listingId={listing.id}
          listingTitle={listing.title}
        />
      )}
    </>
  );
};

export default ListingDetailModal;
