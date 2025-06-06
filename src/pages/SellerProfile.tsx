
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SellerProfile = () => {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [printerModels, setPrinterModels] = useState("");
  const [status, setStatus] = useState("available");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || profile?.user_type !== 'seller') {
      navigate('/seller-signin');
      return;
    }
    fetchSellerProfile();
  }, [user, profile, navigate]);

  const fetchSellerProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setBusinessName(data.business_name || "");
        setLocation(data.location || "");
        setPriceRange(data.price_range || "");
        setSpecialties(data.specialties || "");
        setPrinterModels(data.printer_models || "");
        setStatus(data.availability_status || "available");
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!businessName || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least your business name and location.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const profileData = {
        business_name: businessName,
        location,
        price_range: priceRange,
        specialties,
        printer_models: printerModels,
        availability_status: status,
      };

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Saved",
        description: "Your seller profile has been updated successfully.",
      });

      navigate('/seller-dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
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
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business name"
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
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerProfile;
