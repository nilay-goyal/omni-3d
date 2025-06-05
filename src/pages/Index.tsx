import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Users, MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <Printer className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Omni3D</h1>
            </Link>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Link to="/buyer-signin">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">Find Printer</Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Marketplace
                </Button>
              </Link>
              <Link to="/seller-signin">
                <Button size="sm" className="text-xs sm:text-sm">Offer Services</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
            Connect with Local
            <span className="text-blue-600"> 3D Printer Owners</span>
          </h1>
          <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 px-4">
            Whether you need something printed or want to offer your 3D printing services, 
            Omni3D connects you with your local community.
          </p>
          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
            <Link to="/buyer-signin">
              <Button size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3">
                Find Printer
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 sm:px-8 py-3">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Marketplace
              </Button>
            </Link>
            <Link to="/seller-signin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 sm:px-8 py-3">
                Offer Services
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 sm:mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Simple Sign In</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Quick and easy sign-in process for both buyers and sellers.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Printer className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Upload Your Design</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload your STL files and describe what you need printed.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Find Local Printers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View nearby 3D printer owners on an interactive map.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Connect & Print</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Message sellers directly to discuss your printing needs.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 sm:mt-24 bg-white rounded-2xl shadow-xl p-6 sm:p-12 text-center mx-4 sm:mx-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
            Join the local 3D printing community today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Link to="/buyer-signin">
              <Button size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3">
                I Need Something Printed
              </Button>
            </Link>
            <Link to="/seller-signin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 sm:px-8 py-3">
                I Have a 3D Printer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Printer className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">Omni3D</span>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Connecting the 3D printing community, one print at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
