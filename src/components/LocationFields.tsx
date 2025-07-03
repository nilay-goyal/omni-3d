
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LocationFieldsProps {
  formData: {
    location_country: string;
    location_state: string;
    location_city: string;
    postal_code: string;
    street_address?: string;
    latitude?: number;
    longitude?: number;
  };
  onFieldChange: (field: string, value: string | number) => void;
}

const countries = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Brazil", "Bulgaria", "Cambodia",
  "Canada", "Chile", "China", "Colombia", "Croatia", "Czech Republic", "Denmark", "Ecuador",
  "Egypt", "Estonia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", "Guatemala",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Latvia", "Lebanon", "Lithuania", "Luxembourg",
  "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan",
  "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia",
  "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka",
  "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Venezuela", "Vietnam"
];

const LocationFields = ({ formData, onFieldChange }: LocationFieldsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      const letter = e.key.toLowerCase();
      const country = countries.find(c => c.toLowerCase().startsWith(letter));
      if (country) {
        onFieldChange('location_country', country);
      }
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Save coordinates
          onFieldChange('latitude', latitude);
          onFieldChange('longitude', longitude);
          
          toast({
            title: "Location detected!",
            description: "Your coordinates have been saved. Please fill in your address details.",
          });
          
          setIsGettingLocation(false);
        } catch (error) {
          console.error('Error getting address:', error);
          toast({
            title: "Error",
            description: "Could not get your location. Please enter your address manually.",
            variant: "destructive",
          });
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let message = "Could not get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enter your address manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable. Please enter your address manually.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out. Please enter your address manually.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Location *</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="flex items-center gap-2"
        >
          {isGettingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {isGettingLocation ? "Getting location..." : "Use my location"}
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="street_address">Street Address *</Label>
          <Input
            id="street_address"
            placeholder="Enter your street address (e.g., 123 Main St, Apt 4B)"
            value={formData.street_address || ''}
            onChange={(e) => onFieldChange('street_address', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location_city">City *</Label>
            <Input
              id="location_city"
              placeholder="Enter city"
              value={formData.location_city}
              onChange={(e) => onFieldChange('location_city', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="location_state">Province/State *</Label>
            <Input
              id="location_state"
              placeholder="Enter province/state"
              value={formData.location_state}
              onChange={(e) => onFieldChange('location_state', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location_country">Country *</Label>
            <Select 
              value={formData.location_country} 
              onValueChange={(value) => onFieldChange('location_country', value)}
              onOpenChange={setIsOpen}
            >
              <SelectTrigger onKeyDown={handleKeyPress}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {filteredCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="postal_code">Postal Code *</Label>
            <Input
              id="postal_code"
              placeholder="Enter postal code"
              value={formData.postal_code}
              onChange={(e) => onFieldChange('postal_code', e.target.value)}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationFields;
