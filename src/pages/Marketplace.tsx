
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Printer, Search, MapPin, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ListingDetailModal from "@/components/ListingDetailModal";

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location_city: string;
  location_state: string;
  views_count: number;
  created_at: string;
  seller_id: string;
  images: {
    image_url: string;
    is_primary: boolean;
  }[];
  seller: {
    full_name: string;
  } | null;
  category: {
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

const Marketplace = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchListings();
    fetchCategories();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          id,
          title,
          description,
          price,
          condition,
          location_city,
          location_state,
          views_count,
          created_at,
          seller_id,
          images:marketplace_images(image_url, is_primary),
          seller:profiles!seller_id(full_name),
          category:marketplace_categories(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleListingClick = (listing: MarketplaceListing) => {
    // If the user is the seller of this listing, open the detail modal
    if (user && listing.seller_id === user.id) {
      setSelectedListingId(listing.id);
      setModalOpen(true);
    } else {
      // For other users' listings, you could implement a different view
      // For now, we'll just show a toast
      toast({
        title: "Contact Seller",
        description: "Contact functionality will be implemented soon"
      });
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

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || listing.category?.name === selectedCategory;
    const matchesCondition = !selectedCondition || listing.condition === selectedCondition;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <Printer className="h-8 w-8 text-green-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Omni3D</h1>
            </Link>
            <div className="flex items-center space-x-4">
              {profile ? (
                <>
                  <span className="text-gray-700">Welcome, {profile.full_name}</span>
                  <Link to={profile.user_type === 'seller' ? '/seller-dashboard' : '/buyer-dashboard'}>
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/buyer-signin">
                    <Button variant="outline" size="sm">Sign In as Buyer</Button>
                  </Link>
                  <Link to="/seller-signin">
                    <Button variant="outline" size="sm">Sign In as Seller</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">3D Marketplace</h1>
          <p className="text-gray-600">Discover amazing 3D printed items from creators around Canada</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Any Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Condition</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like_new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Printer className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Card 
                key={listing.id} 
                className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                onClick={() => handleListingClick(listing)}
              >
                <div className="relative aspect-square">
                  <img
                    src={getPrimaryImage(listing.images)}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-white/80">
                      {listing.condition}
                    </Badge>
                  </div>
                  {/* Indicate if this is the user's own listing */}
                  {user && listing.seller_id === user.id && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-600">Your Listing</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                      {listing.title}
                    </h3>
                    <p className="text-lg font-bold text-blue-600">
                      {formatPrice(listing.price)}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {listing.location_city}, {listing.location_state}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{listing.seller?.full_name || 'Unknown Seller'}</span>
                    <span>{listing.views_count} views</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Listing Detail Modal */}
      <ListingDetailModal
        listingId={selectedListingId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Marketplace;
