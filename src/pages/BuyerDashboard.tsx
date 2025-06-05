
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Map, MessageCircle, LogOut, Printer } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const BuyerDashboard = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const userType = localStorage.getItem('userType');
    
    if (!storedName || userType !== 'buyer') {
      navigate('/buyer-signin');
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
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="mt-2 text-gray-600">Upload your designs and find local 3D printer owners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Upload File */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Upload STL File</CardTitle>
              <CardDescription>
                Upload your 3D model files to get started with printing requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/upload-file">
                <Button className="w-full">Upload File</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Find Printers */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Map className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Find Printers</CardTitle>
              <CardDescription>
                Browse nearby 3D printer owners on an interactive map.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/printer-map">
                <Button className="w-full" variant="outline">View Map</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                View responses from 3D printer owners and discuss your projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/messages">
                <Button className="w-full" variant="outline">View Messages</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <Upload className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Step 1: Upload Your STL File</h3>
                    <p className="text-gray-600">Share your 3D model with potential printers.</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <Map className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Step 2: Find Local Printers</h3>
                    <p className="text-gray-600">Browse the map to see nearby 3D printer owners.</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                  <MessageCircle className="h-8 w-8 text-purple-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Step 3: Connect and Print</h3>
                    <p className="text-gray-600">Message sellers to discuss your printing needs.</p>
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

export default BuyerDashboard;
