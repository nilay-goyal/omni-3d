
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const SellerProfile = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [printerModels, setPrinterModels] = useState("");
  const [status, setStatus] = useState("available");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'seller') {
      navigate('/seller-signin');
      return;
    }

    // Load existing profile data if available
    const savedProfile = localStorage.getItem('sellerProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setName(profile.name || "");
      setLocation(profile.location || "");
      setPriceRange(profile.priceRange || "");
      setSpecialties(profile.specialties || "");
      setPrinterModels(profile.printerModels || "");
      setStatus(profile.status || "available");
    }
  }, [navigate]);

  const handleSaveProfile = () => {
    if (!name || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least your name and location.",
        variant: "destructive",
      });
      return;
    }

    const profile = {
      name,
      location,
      priceRange,
      specialties,
      printerModels,
      status,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('sellerProfile', JSON.stringify(profile));
    
    toast({
      title: "Profile Saved",
      description: "Your seller profile has been updated successfully.",
    });

    navigate('/seller-dashboard');
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
            <Link to="/seller-dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Profile Setup</h1>
          <p className="mt-2 text-gray-600">Complete your profile to help buyers find and connect with you.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Provide details about your 3D printing services and capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name or business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceRange">Price Range</Label>
              <Input
                id="priceRange"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="e.g., $0.10-$0.50 per gram"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties / Materials Offered</Label>
              <Textarea
                id="specialties"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="e.g., PLA, ABS, PETG, TPU, High-detail miniatures, Functional prototypes"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="printerModels">3D Printer Model(s)</Label>
              <Textarea
                id="printerModels"
                value={printerModels}
                onChange={(e) => setPrinterModels(e.target.value)}
                placeholder="e.g., Ender 3 V2, Prusa i3 MK3S+, Bambu Lab X1 Carbon"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Availability Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="do-not-show">Do Not Show</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                "Do Not Show" will hide you from the buyer map view
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link to="/seller-dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSaveProfile}>Save Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerProfile;
