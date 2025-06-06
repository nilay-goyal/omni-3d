
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

interface LocationFieldsProps {
  formData: {
    location_country: string;
    location_state: string;
    location_city: string;
    postal_code: string;
  };
  onFieldChange: (field: string, value: string) => void;
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Location *</h3>
      
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
  );
};

export default LocationFields;
