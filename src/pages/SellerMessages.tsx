
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UnifiedMessaging from "@/components/UnifiedMessaging";

const SellerMessages = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || profile?.user_type !== 'seller')) {
      navigate('/seller-signin');
      return;
    }
  }, [user, profile, loading, navigate]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/seller-dashboard" className="flex items-center">
              <Printer className="h-8 w-8 text-green-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Omni3D</h1>
            </Link>
            <Link to="/seller-dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-2 text-gray-600">Communicate with potential customers about their printing needs</p>
        </div>

        <UnifiedMessaging />
      </div>
    </div>
  );
};

export default SellerMessages;
