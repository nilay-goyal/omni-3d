
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Settings, MessageCircle, LogOut, User, Package, Plus } from "lucide-react";
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
    localStorage.removeItem('sellerProfile');
    navigate('/');
  };

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
              <span className="text-gray-700">Welcome, {userName}</span>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your 3D printing services and connect with buyers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Setup */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Profile Setup</CardTitle>
              <CardDescription>
                Set up your profile with printer capabilities, services, and location.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/seller-profile">
                <Button className="w-full">Edit Profile</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                View and respond to printing requests from buyers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/messages">
                <Button className="w-full" variant="outline">View Messages</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/settings">
                <Button className="w-full" variant="outline">Settings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Your Listings Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Listings</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Listing
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder listings */}
            {[1, 2, 3].map((item) => (
              <Card key={item} className="bg-gray-800 text-white border-gray-700">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-400">Parent group's Listing's name - deleted</h3>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Printer className="h-4 w-4 mr-2" />
                      Parent group's Listing's seller's printer_type
                    </div>
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Parent group's Listing's material
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 rounded-full bg-gray-600 mr-2"></span>
                      Parent group's Listing's color
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">$</span>
                      Parent group's Listing's price
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="secondary" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <User className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Step 1: Complete Your Profile</h3>
                    <p className="text-gray-600">Add your printer details, services offered, and location.</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <MessageCircle className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Step 2: Respond to Messages</h3>
                    <p className="text-gray-600">Check for printing requests from local buyers.</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                  <Printer className="h-8 w-8 text-purple-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Step 3: Start Printing</h3>
                    <p className="text-gray-600">Connect with buyers and start offering your services.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
