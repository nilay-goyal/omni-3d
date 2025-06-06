
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface SellerListing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location_city: string;
  location_state: string;
  is_active: boolean;
  featured: boolean;
  views_count: number;
  created_at: string;
  images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

interface SellerListingCardProps {
  listing: SellerListing;
  onDelete: (listingId: string) => void;
  onToggleStatus: (listingId: string, currentStatus: boolean) => void;
}

const SellerListingCard = ({ listing, onDelete, onToggleStatus }: SellerListingCardProps) => {
  const navigate = useNavigate();

  const handleListingClick = () => {
    navigate(`/edit-listing/${listing.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-listing/${listing.id}`);
  };

  const handleDeleteButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(listing.id);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStatus(listing.id, listing.is_active);
  };

  const getPrimaryImage = (images: any[]) => {
    const primaryImage = images.find(img => img.is_primary);
    return primaryImage?.image_url || images[0]?.image_url || '/placeholder.svg';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(price);
  };

  return (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
        !listing.is_active ? 'opacity-60 bg-gray-50 border-gray-200' : 'bg-white'
      }`}
      onClick={handleListingClick}
    >
      <div className="relative">
        {listing.images && listing.images.length > 0 ? (
          listing.images.length === 1 ? (
            <div className="aspect-square">
              <img
                src={listing.images[0].image_url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square">
              <Carousel className="w-full h-full">
                <CarouselContent>
                  {listing.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <img
                        src={image.image_url}
                        alt={`${listing.title} ${index + 1}`}
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
          <div className="aspect-square bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <Badge variant={listing.is_active ? "default" : "secondary"} className={
            !listing.is_active ? 'bg-gray-400 text-gray-700' : ''
          }>
            {listing.is_active ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className={`font-semibold line-clamp-1 mb-1 ${
            !listing.is_active ? 'text-gray-600' : 'text-gray-900'
          }`}>
            {listing.title}
          </h3>
          <p className={`text-lg font-bold ${
            !listing.is_active ? 'text-gray-500' : 'text-blue-600'
          }`}>
            {formatPrice(listing.price)}
          </p>
        </div>
        
        <div className={`flex items-center text-sm mb-3 ${
          !listing.is_active ? 'text-gray-500' : 'text-gray-600'
        }`}>
          <MapPin className="h-3 w-3 mr-1" />
          {listing.location_city}, {listing.location_state}
        </div>

        <div className={`flex items-center justify-between text-sm mb-4 ${
          !listing.is_active ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <div className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            {listing.views_count} views
          </div>
          <span>{new Date(listing.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleToggleClick}
          >
            {listing.is_active ? "Unpublish" : "Publish"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteButtonClick}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerListingCard;
