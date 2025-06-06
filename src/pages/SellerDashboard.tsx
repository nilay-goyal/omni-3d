
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Package, MessageCircle, LogOut, Printer, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [messagesCount, setMessagesCount] = useState(0);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (loading || redirected) return;

    console.log('=== SELLER DASHBOARD REDIRECT LOGIC ===');
    console.log('Loading:', loading);
    console.log('User ID:', user?.id);
    console.log('Full Profile Object:', profile);
    console.log('Profile user_type:', profile?.user_type);
    console.log('Current URL:', window.location.pathname);
    
    if (!user) {
      console.log('❌ No user found, redirecting to seller signin');
      setRedirected(true);
      navigate('/seller-signin');
      return;
    }
    
    if (profile) {
      if (profile.user_type === 'buyer') {
        console.log('❌ User is a BUYER trying to access SELLER dashboard');
        console.log('🔄 Redirecting buyer to buyer dashboard');
        setRedirected(true);
        navigate('/buyer-dashboard');
        return;
      } else if (profile.user_type === 'seller') {
        console.log('✅ User is confirmed SELLER, staying on seller dashboard');
        fetchMessagesCount();
        return;
      } else {
        console.log('❌ Unknown user type:', profile.user_type);
        setRedirected(true);
        navigate('/seller-signin');
        return;
      }
    } else if (user) {
      console.log('❌ No profile found, redirecting to seller signin');
      setRedirected(true);
      navigate('/seller-signin');
      return;
    }
  }, [user, profile, loading, navigate, redirected]);

  const fetchMessagesCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('unread_messages_count')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setMessagesCount(data?.unread_messages_count || 0);
    } catch (error) {
      console.error('Error fetching messages count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile || redirected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (profile.user_type !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">This area is for sellers only.</p>
          <p className="text-sm text-gray-500 mb-6">
            Your account type: <span className="font-semibold">{profile.user_type}</span>
          </p>
          <div className="space-x-4">
            <Link to="/buyer-dashboard">
              <Button>Go to Buyer Dashboard</Button>
            </Link>
            <Link to="/seller-signin">
              <Button variant="outline">Sign up as Seller</Button>
            </Link>
          </div>
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
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-gray-700 text-sm sm:text-base hidden sm:inline">Welcome, {profile.full_name}</span>
              <span className="text-gray-700 text-sm sm:hidden">Hi, {profile.full_name.split(' ')[0]}</span>
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
                Create and manage your marketplace listings for pre-printed items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/seller-listings">
                <Button className="w-full">Manage Listings</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-purple-600" />
                {messagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {messagesCount}
                  </span>
                )}
              </div>
              <CardTitle className="text-lg sm:text-xl">Messages</CardTitle>
              <CardDescription className="text-sm">
                Communicate with potential customers about their printing needs.
                {messagesCount > 0 && (
                  <span className="block mt-1 text-purple-600 font-medium">
                    {messagesCount} new message{messagesCount !== 1 ? 's' : ''}
                  </span>
                )}
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
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{messagesCount}</p>
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
