
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Star, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Seller {
  id: string;
  name: string;
  rating: number;
  distance: string;
  priceRange: string;
  specialties: string[];
  location: string;
  available: boolean;
}

const PrinterMap = () => {
  // Fake sellers data for showcase
  const [sellers] = useState<Seller[]>([
    {
      id: "1",
      name: "Tech Print Solutions",
      rating: 4.8,
      distance: "0.5 miles",
      priceRange: "$10-50",
      specialties: ["PLA", "ABS", "PETG"],
      location: "Downtown",
      available: true
    },
    {
      id: "2",
      name: "MakerSpace Pro",
      rating: 4.6,
      distance: "1.2 miles",
      priceRange: "$15-75",
      specialties: ["PLA", "TPU", "Wood Fill"],
      location: "Business District",
      available: true
    },
    {
      id: "3",
      name: "Precision Prints",
      rating: 4.9,
      distance: "2.1 miles",
      priceRange: "$20-100",
      specialties: ["ABS", "PETG", "Metal Fill"],
      location: "Industrial Park",
      available: false
    },
    {
      id: "4",
      name: "Creative 3D Hub",
      rating: 4.4,
      distance: "2.8 miles",
      priceRange: "$8-40",
      specialties: ["PLA", "Glow-in-Dark", "Multi-color"],
      location: "Arts Quarter",
      available: true
    }
  ]);

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
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          {/* Sellers List */}
          <div className="space-y-4 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Printers Near You</h2>
            
            {sellers.map((seller) => (
              <Card key={seller.id} className={`hover:shadow-lg transition-shadow ${!seller.available ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{seller.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {seller.location} • {seller.distance}
                      </CardDescription>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{seller.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Price Range: {seller.priceRange}</p>
                      <p className="text-sm text-gray-600">
                        Specialties: {seller.specialties.join(", ")}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        seller.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {seller.available ? 'Available' : 'Busy'}
                      </span>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled={!seller.available}>
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" disabled={!seller.available}>
                          Request Quote
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map</h3>
                <p className="text-gray-600 max-w-sm">
                  Map integration coming soon. This will show the locations of all available 3D printers in your area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterMap;
