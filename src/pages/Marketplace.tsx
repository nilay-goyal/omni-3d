
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, ShoppingBag, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const Marketplace = () => {
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
            <div className="flex space-x-4">
              <Link to="/buyer-signin">
                <Button variant="outline">Find a Printer</Button>
              </Link>
              <Link to="/seller-signin">
                <Button>Offer Services</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">3D Print Marketplace</h1>
          <p className="mt-2 text-gray-600">Browse pre-printed items from local sellers.</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search for items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Coming Soon Section */}
        <Card className="text-center py-16">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Marketplace Coming Soon!</CardTitle>
            <CardDescription className="text-lg mt-4 max-w-2xl mx-auto">
              We're building an amazing marketplace where sellers can list pre-printed 3D items for immediate purchase. 
              This feature will be available soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-4 mt-8">
              <Link to="/buyer-signin">
                <Button size="lg">
                  Find Custom Printing
                </Button>
              </Link>
              <Link to="/seller-signin">
                <Button size="lg" variant="outline">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Preview Cards */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What to Expect</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pre-printed Items</CardTitle>
                <CardDescription>
                  Browse ready-to-ship 3D printed items from local sellers.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instant Purchase</CardTitle>
                <CardDescription>
                  Buy items immediately without waiting for custom printing.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Local Pickup</CardTitle>
                <CardDescription>
                  Support local makers and reduce shipping costs.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
