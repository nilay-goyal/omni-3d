
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const SellerListingsHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Listings</h1>
        <p className="mt-2 text-gray-600">Create and manage your marketplace listings</p>
      </div>
      <Link to="/create-listing">
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create New Listing
        </Button>
      </Link>
    </div>
  );
};

export default SellerListingsHeader;
