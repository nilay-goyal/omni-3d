
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Star, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "@googlemaps/js-api-loader";
import ChatModal from "@/components/ChatModal";

interface Seller {
  id: string;
  full_name: string;
  business_name: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  street_address: string | null;
  postal_code: string | null;
  price_range: string | null;
  specialties: string | null;
  availability_status: string | null;
  latitude: number | null;
  longitude: number | null;
}

const PrinterMap = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [sellersLoading, setSellersLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSeller, setChatSeller] = useState<Seller | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Get user's current location
  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch sellers from database
  useEffect(() => {
    fetchSellers();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location');
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please ensure location permissions are enabled.",
            variant: "destructive"
          });
        }
      );
    } else {
      setLocationError('Geolocation not supported');
      toast({
        title: "Location Not Supported",
        description: "Your browser does not support geolocation",
        variant: "destructive"
      });
    }
  };

  // Initialize Google Maps
  useEffect(() => {
    if (mapRef.current) {
      initializeMap();
    }
  }, [sellers, userLocation]);

  const fetchSellers = async () => {
    try {
      setSellersLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'seller')
        .not('location_city', 'is', null);

      if (error) throw error;
      
      console.log('Fetched sellers:', data);
      setSellers(data || []);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast({
        title: "Error",
        description: "Failed to load sellers",
        variant: "destructive"
      });
    } finally {
      setSellersLoading(false);
    }
  };

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      const loader = new Loader({
        apiKey: "AIzaSyBoksv5BGmomFNMP-vc1Y1AYCOxPvX_0WU",
        version: "weekly",
        libraries: ["maps", "marker"]
      });

      await loader.load();

      // Initialize map centered on user location, then first seller, then default
      let mapCenter;
      if (userLocation) {
        mapCenter = userLocation;
      } else {
        const firstSeller = sellers.find(s => s.latitude && s.longitude);
        mapCenter = firstSeller 
          ? { lat: firstSeller.latitude!, lng: firstSeller.longitude! }
          : { lat: 43.6532, lng: -79.3832 }; // Default to Toronto
      }

      const map = new google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 10,
        mapId: "DEMO_MAP_ID"
      });

      mapInstanceRef.current = map;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.map = null);
      markersRef.current = [];

      // Add markers for each seller with coordinates
      const sellersWithCoords = sellers.filter(seller => seller.latitude && seller.longitude);
      console.log('Sellers with coordinates:', sellersWithCoords);

      sellersWithCoords.forEach((seller) => {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: Number(seller.latitude), lng: Number(seller.longitude) },
          map: map,
          title: seller.business_name || seller.full_name
        });

        // Add click listener to marker
        marker.addListener('click', () => {
          setSelectedSeller(seller);
        });

        markersRef.current.push(marker);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "Failed to load Google Maps",
        variant: "destructive"
      });
    }
  };

  const formatSellerName = (seller: Seller) => {
    return seller.business_name || seller.full_name;
  };

  const formatLocation = (seller: Seller) => {
    const parts = [seller.location_city, seller.location_state].filter(Boolean);
    return parts.join(', ');
  };

  const formatSpecialties = (specialties: string | null) => {
    if (!specialties) return 'General 3D Printing';
    return specialties;
  };

  const handleOpenChat = (seller: Seller) => {
    setChatSeller(seller);
    setChatOpen(true);
  };

  if (loading || sellersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading sellers...</p>
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
            <Link to="/buyer-dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Find Local Printers</h1>
            <Button onClick={getUserLocation} variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Use My Location
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          {/* Sellers List */}
          <div className="space-y-4 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Printers Near You</h2>
            
            {sellers.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Sellers Found</h3>
                    <p className="text-gray-600">There are currently no available sellers in your area.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              sellers.map((seller) => (
                <Card 
                  key={seller.id} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedSeller?.id === seller.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedSeller(seller)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{formatSellerName(seller)}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {formatLocation(seller)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium">4.5</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Price Range: {seller.price_range || '$10-50'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Specialties: {formatSpecialties(seller.specialties)}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Available
                        </span>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChat(seller);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChat(seller);
                            }}
                          >
                            Request Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Google Map */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div 
              ref={mapRef}
              className="h-full min-h-[400px]"
              style={{ height: '100%' }}
            />
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      {chatSeller && (
        <ChatModal
          open={chatOpen}
          onOpenChange={setChatOpen}
          sellerId={chatSeller.id}
          sellerName={formatSellerName(chatSeller)}
          listingId={null}
          listingTitle="General Inquiry"
        />
      )}
    </div>
  );
};

export default PrinterMap;
