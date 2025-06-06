
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const SellerListingsEmptyState = () => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Plus className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
        <p className="text-gray-600 mb-4">Create your first marketplace listing to start selling</p>
        <Link to="/create-listing">
          <Button>Create Your First Listing</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default SellerListingsEmptyState;
