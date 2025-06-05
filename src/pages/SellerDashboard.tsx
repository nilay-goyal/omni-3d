
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Package, MessageCircle, LogOut, Printer, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const SellerDashboard = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const userType = localStorage.getItem('userType');
    
    if (!storedName || userType !== 'seller') {
      navigate('/seller-signin');
      return;
    }
    
    setUserName(storedName);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <Printer className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Omni3D</h1>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-gray-700 text-sm sm:text-base hidden sm:inline">Welcome, {userName}</span>
              <span className="text-gray-700 text-sm sm:hidden">Hi, {userName.split(' ')[0]}</span>
              <Button variant="ghost" onClick={handleLogout} size="sm">
                <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Manage your 3D printing services and connect with customers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Settings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Profile Settings</CardTitle>
              <CardDescription className="text-sm">
                Update your printer info, location, pricing, and availability status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/seller-profile">
                <Button className="w-full">Edit Profile</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Your Listings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Your Listings</CardTitle>
              <CardDescription className="text-sm">
                Create and manage pre-printed items for the marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Marketplace listings coming soon!</p>
                    <p className="text-xs text-gray-400 mt-1">
                      You'll be able to list pre-printed items for immediate sale.
                    </p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" disabled>
                  Create Listing (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Messages</CardTitle>
              <CardDescription className="text-sm">
                Communicate with potential customers about their printing needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/seller-messages">
                <Button className="w-full" variant="outline">View Messages</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Your Performance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Messages Received</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Items Sold</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Rating</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">New</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
