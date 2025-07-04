
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Printer, Search, MapPin, Eye, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ListingDetailModal from "@/components/ListingDetailModal";

interface Category {
  id: string;
  name: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  condition: string;
  location_city: string | null;
  location_state: string | null;
  views_count: number;
  created_at: string;
  is_active: boolean;
  seller: {
    full_name: string;
  } | null;
  images: {
    image_url: string;
    is_primary: boolean;
  }[];
  category: {
    name: string;
  } | null;
}

const Marketplace = () => {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    console.log('Marketplace component mounted, fetching data...');
    fetchListings();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      console.log('Categories fetched:', data);
      setCategories((data || []).filter(cat => cat.id && cat.id.trim() !== ''));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      
      // Fetch listings with limit for better performance
      const { data: listingsData, error: listingsError } = await supabase
        .from('marketplace_listings')
        .select(`
          id,
          title,
          price,
          condition,
          location_city,
          location_state,
          views_count,
          created_at,
          is_active,
          seller_id,
          category_id
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50); // Limit for better performance

      if (listingsError) throw listingsError;

      if (!listingsData || listingsData.length === 0) {
        setListings([]);
        return;
      }

      // Get unique IDs for batch fetching
      const sellerIds = [...new Set(listingsData.map(l => l.seller_id))];
      const categoryIds = [...new Set(listingsData.map(l => l.category_id).filter(Boolean))];
      const listingIds = listingsData.map(l => l.id);

      // Fetch all related data in parallel
      const [sellersResponse, categoriesResponse, imagesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', sellerIds),
        
        categoryIds.length > 0 
          ? supabase
              .from('marketplace_categories')
              .select('id, name')
              .in('id', categoryIds)
          : Promise.resolve({ data: [] }),
        
        supabase
          .from('marketplace_images')
          .select('listing_id, image_url, is_primary')
          .in('listing_id', listingIds)
          .order('is_primary', { ascending: false })
      ]);

      // Create lookup maps for O(1) access
      const sellersMap = new Map<string, { id: string; full_name: string }>();
      sellersResponse.data?.forEach(seller => {
        sellersMap.set(seller.id, seller);
      });
      
      const categoriesMap = new Map<string, { id: string; name: string }>();
      categoriesResponse.data?.forEach(category => {
        categoriesMap.set(category.id, category);
      });
      
      const imagesMap = new Map<string, any[]>();
      
      // Group images by listing_id
      imagesResponse.data?.forEach(image => {
        if (!imagesMap.has(image.listing_id)) {
          imagesMap.set(image.listing_id, []);
        }
        imagesMap.get(image.listing_id)!.push(image);
      });

      // Combine all data efficiently
      const enrichedListings: Listing[] = listingsData.map(listing => ({
        ...listing,
        seller: sellersMap.get(listing.seller_id) || null,
        category: categoriesMap.get(listing.category_id) || null,
        images: imagesMap.get(listing.id) || []
      }));

      setListings(enrichedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchTerm || listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || listing.category?.name === selectedCategory;
    const matchesCondition = selectedCondition === "all" || listing.condition === selectedCondition;
    const matchesPrice = (!priceRange.min || listing.price >= parseFloat(priceRange.min)) &&
                        (!priceRange.max || listing.price <= parseFloat(priceRange.max));
    
    return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
  });

  console.log('Filtered listings count:', filteredListings.length);
  console.log('Applied filters:', { searchTerm, selectedCategory, selectedCondition, priceRange });

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

  const handleListingClick = async (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    // Increment view count
    try {
      await supabase
        .from('marketplace_listings')
        .update({ views_count: listing.views_count + 1 })
        .eq('id', listingId);
      
      // Update local state
      setListings(prev => prev.map(l => 
        l.id === listingId ? { ...l, views_count: l.views_count + 1 } : l
      ));
    } catch (error) {
      console.error('Error updating view count:', error);
    }

    setSelectedListingId(listingId);
    setModalOpen(true);
  };

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
            <div className="flex space-x-4">
              {profile?.user_type === 'seller' ? (
                <Link to="/seller-dashboard">
                  <Button variant="outline">Seller Dashboard</Button>
                </Link>
              ) : (
                <Link to="/buyer-dashboard">
                  <Button variant="outline">Buyer Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">3D Print Marketplace</h1>
              <p className="mt-2 text-gray-600">Discover unique 3D printed items from local sellers</p>
              <p className="mt-1 text-sm text-gray-500">Showing {filteredListings.length} of {listings.length} listings</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/printer-map">
                <Button variant="outline" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Local Printers
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Condition Filter */}
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="All Conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range */}
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Max price"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedCondition("all");
                  setPriceRange({ min: "", max: "" });
                }}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        {listings.length === 0 && !loading && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              No listings found in database. This could be due to:
            </p>
            <ul className="text-yellow-700 text-xs mt-2 ml-4 list-disc">
              <li>No listings have been created yet</li>
              <li>All listings are marked as inactive</li>
              <li>Database connection issues</li>
            </ul>
          </div>
        )}

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {listings.length === 0 ? 'No listings available' : 'No listings match your filters'}
            </div>
            <p className="text-gray-400 mt-2">
              {listings.length === 0 
                ? 'Check back later for new items or browse our seller dashboard to create listings' 
                : 'Try adjusting your filters or search terms'
              }
            </p>
            {listings.length === 0 && (
              <div className="mt-4">
                <Button onClick={fetchListings} variant="outline">
                  Refresh Listings
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Card 
                key={listing.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleListingClick(listing.id)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={getPrimaryImage(listing.images)}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">{listing.condition}</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(listing.price)}
                      </span>
                      {listing.category && (
                        <Badge variant="outline">{listing.category.name}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.location_city && listing.location_state 
                          ? `${listing.location_city}, ${listing.location_state}`
                          : 'Location not specified'
                        }
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {listing.views_count}
                      </div>
                    </div>
                    
                    {listing.seller && (
                      <div className="mt-2 text-sm text-gray-600">
                        By {listing.seller.full_name}
                      </div>
                    )}
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
