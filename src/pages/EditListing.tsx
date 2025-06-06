
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Upload, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
}

const EditListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingListing, setLoadingListing] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    condition: '',
    material: '',
    dimensions: '',
    weight_grams: '',
    print_time_hours: '',
    location_city: '',
    location_state: '',
    location_country: 'Canada'
  });

  useEffect(() => {
    if (!loading && (!user || profile?.user_type !== 'seller')) {
      navigate('/seller-signin');
      return;
    }
    
    if (user && id) {
      fetchListing();
    }
    fetchCategories();
  }, [user, profile, loading, navigate, id]);

  const fetchListing = async () => {
    if (!id) return;

    try {
      setLoadingListing(true);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          images:marketplace_images(image_url, is_primary)
        `)
        .eq('id', id)
        .eq('seller_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          category_id: data.category_id || '',
          condition: data.condition || '',
          material: data.material || '',
          dimensions: data.dimensions || '',
          weight_grams: data.weight_grams?.toString() || '',
          print_time_hours: data.print_time_hours?.toString() || '',
          location_city: data.location_city || '',
          location_state: data.location_state || '',
          location_country: data.location_country || 'Canada'
        });

        // Set image preview if exists
        const primaryImage = data.images?.find((img: any) => img.is_primary);
        if (primaryImage) {
          setImagePreview(primaryImage.image_url);
        }
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Error",
        description: "Failed to load listing",
        variant: "destructive"
      });
      navigate('/seller-listings');
    } finally {
      setLoadingListing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!user || !id) return;

    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Only require condition for published listings, not drafts
    if (!isDraft && !formData.condition) {
      toast({
        title: "Error",
        description: "Please select a condition before publishing",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Update the listing
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        condition: formData.condition || '',
        material: formData.material || null,
        dimensions: formData.dimensions || null,
        weight_grams: formData.weight_grams ? parseInt(formData.weight_grams) : null,
        print_time_hours: formData.print_time_hours ? parseInt(formData.print_time_hours) : null,
        location_city: formData.location_city || null,
        location_state: formData.location_state || null,
        location_country: formData.location_country,
        is_active: !isDraft,
        updated_at: new Date().toISOString()
      };

      const { error: listingError } = await supabase
        .from('marketplace_listings')
        .update(listingData)
        .eq('id', id)
        .eq('seller_id', user.id);

      if (listingError) throw listingError;

      // Update image if a new one was provided
      if (imageFile) {
        // For now, we'll store a placeholder URL since we don't have storage set up
        const imageUrl = `/placeholder.svg`;

        // First, update existing primary image or insert new one
        const { data: existingImages } = await supabase
          .from('marketplace_images')
          .select('id')
          .eq('listing_id', id)
          .eq('is_primary', true);

        if (existingImages && existingImages.length > 0) {
          // Update existing primary image
          const { error: imageError } = await supabase
            .from('marketplace_images')
            .update({
              image_url: imageUrl,
              alt_text: formData.title
            })
            .eq('id', existingImages[0].id);

          if (imageError) {
            console.error('Error updating image record:', imageError);
          }
        } else {
          // Insert new primary image
          const { error: imageError } = await supabase
            .from('marketplace_images')
            .insert({
              listing_id: id,
              image_url: imageUrl,
              is_primary: true,
              alt_text: formData.title
            });

          if (imageError) {
            console.error('Error saving image record:', imageError);
          }
        }
      }

      toast({
        title: "Success",
        description: isDraft ? "Listing updated and saved as draft" : "Listing updated and published successfully"
      });

      navigate('/seller-listings');
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingListing) {
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
            <Link to="/seller-listings">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Listings
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
          <p className="mt-2 text-gray-600">Update your 3D printed item listing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Listing Details</CardTitle>
                <CardDescription>Update information about your 3D printed item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Product Name *</Label>
                    <Input
                      id="title"
                      placeholder="Enter product name"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your item..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (CAD) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition *</Label>
                      <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like_new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 3D Printing Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">3D Printing Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        placeholder="e.g., PLA, ABS, PETG"
                        value={formData.material}
                        onChange={(e) => handleInputChange('material', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        placeholder="e.g., 10cm x 5cm x 3cm"
                        value={formData.dimensions}
                        onChange={(e) => handleInputChange('dimensions', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight_grams">Weight (grams)</Label>
                      <Input
                        id="weight_grams"
                        type="number"
                        placeholder="Weight in grams"
                        value={formData.weight_grams}
                        onChange={(e) => handleInputChange('weight_grams', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="print_time_hours">Print Time (hours)</Label>
                      <Input
                        id="print_time_hours"
                        type="number"
                        placeholder="Hours to print"
                        value={formData.print_time_hours}
                        onChange={(e) => handleInputChange('print_time_hours', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location_city">City</Label>
                      <Input
                        id="location_city"
                        placeholder="Enter city"
                        value={formData.location_city}
                        onChange={(e) => handleInputChange('location_city', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location_state">Province/State</Label>
                      <Input
                        id="location_state"
                        placeholder="Enter province/state"
                        value={formData.location_state}
                        onChange={(e) => handleInputChange('location_state', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Upload & Actions */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
                <CardDescription>Update photo of your item</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div>
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-500">Choose file</span>
                            <span className="text-gray-600"> or drag and drop</span>
                          </Label>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                  >
                    {submitting ? "Updating..." : "Update & Publish"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSubmit(true)}
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save as Draft"}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/seller-listings')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditListing;
