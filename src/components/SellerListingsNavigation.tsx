
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Link } from "react-router-dom";

interface SellerListingsNavigationProps {
  profileName?: string;
}

const SellerListingsNavigation = ({ profileName }: SellerListingsNavigationProps) => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/seller-dashboard" className="flex items-center">
            <img src="/lovable-uploads/accc9980-e782-4a86-8830-76bd3bacadf8.png" alt="Omni3D Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Omni3D</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {profileName}</span>
            <Link to="/seller-dashboard">
              <Button variant="outline" size="sm">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SellerListingsNavigation;
