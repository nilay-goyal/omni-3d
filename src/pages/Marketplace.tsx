
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
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Link to="/buyer-signin">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">Find Printer</Button>
              </Link>
              <Link to="/seller-signin">
                <Button size="sm" className="text-xs sm:text-sm">Offer Services</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">3D Print Marketplace</h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Browse pre-printed items from local sellers.</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search for items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <Button variant="outline" size="sm" className="sm:size-default">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Coming Soon Section */}
        <Card className="text-center py-12 sm:py-16">
          <CardHeader>
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Marketplace Coming Soon!</CardTitle>
            <CardDescription className="text-base sm:text-lg mt-4 max-w-2xl mx-auto px-4">
              We're building an amazing marketplace where sellers can list pre-printed 3D items for immediate purchase. 
              This feature will be available soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 sm:mt-8 px-4">
              <Link to="/buyer-signin">
                <Button size="lg" className="w-full sm:w-auto">
                  Find Custom Printing
                </Button>
              </Link>
              <Link to="/seller-signin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Preview Cards */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">What to Expect</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Pre-printed Items</CardTitle>
                <CardDescription className="text-sm">
                  Browse ready-to-ship 3D printed items from local sellers.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Instant Purchase</CardTitle>
                <CardDescription className="text-sm">
                  Buy items immediately without waiting for custom printing.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Local Pickup</CardTitle>
                <CardDescription className="text-sm">
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
