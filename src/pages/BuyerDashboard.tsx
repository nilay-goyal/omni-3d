
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, MessageCircle, Map, LogOut } from "lucide-react";
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
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">3D Print Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {userName}</span>
              <Button variant="outline" onClick={handleLogout}>
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
          <h2 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h2>
          <p className="mt-2 text-gray-600">Manage your 3D printing projects and find local printing services.</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/upload-file">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Upload className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-lg">Upload Files</CardTitle>
                <CardDescription>Upload your STL files for printing</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/printer-map">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Map className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <CardTitle className="text-lg">Find Printers</CardTitle>
                <CardDescription>Locate nearby 3D printing services</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/messages">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <CardTitle className="text-lg">Messages</CardTitle>
                <CardDescription>Chat with printing service providers</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
            <CardHeader className="text-center">
              <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <CardTitle className="text-lg">Orders</CardTitle>
              <CardDescription>View your printing orders</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>Your recently uploaded STL files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-500">
                  No files uploaded yet. <Link to="/upload-file" className="text-blue-600 hover:underline">Upload your first file</Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Conversations</CardTitle>
              <CardDescription>Recent messages from printing services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-500">
                  No active conversations. <Link to="/messages" className="text-blue-600 hover:underline">Check messages</Link>
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
