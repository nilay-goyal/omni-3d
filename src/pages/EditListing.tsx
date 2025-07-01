import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Upload, ArrowLeft, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import LocationFields from "@/components/LocationFields";

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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

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
    location_country: 'Canada',
    postal_code: '',
    street_address: ''
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
          images:marketplace_images(id, image_url, is_primary, display_order)
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
          location_country: data.location_country || 'Canada',
          postal_code: data.postal_code || '',
          street_address: data.street_address || ''
        });

        // Set existing images
        if (data.images && data.images.length > 0) {
          const sortedImages = data.images.sort((a: any, b: any) => a.display_order - b.display_order);
          setExistingImages(sortedImages);
          setImagePreviews(sortedImages.map((img: any) => img.image_url));
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Create previews for new files
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      processFiles(imageFiles);
    }
  };

  const removeImage = (index: number) => {
    // Check if this is an existing image or new upload
    if (index < existingImages.length) {
      // Remove from existing images
      const newExistingImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(newExistingImages);
    } else {
      // Remove from new uploads
      const newFileIndex = index - existingImages.length;
      const newFiles = imageFiles.filter((_, i) => i !== newFileIndex);
      setImageFiles(newFiles);
    }
    
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
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

    // Only require condition and complete location for published listings, not drafts
    if (!isDraft) {
      if (!formData.condition) {
        toast({
          title: "Error",
          description: "Please select a condition before publishing",
          variant: "destructive"
        });
        return;
      }

      if (!formData.location_country || !formData.location_state || !formData.location_city || !formData.postal_code || !formData.street_address) {
        toast({
          title: "Error",
          description: "Please complete all location fields including street address before publishing",
          variant: "destructive"
        });
        return;
      }
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
        street_address: formData.street_address || null,
        postal_code: formData.postal_code || null,
        is_active: !isDraft,
        updated_at: new Date().toISOString()
      };

      const { error: listingError } = await supabase
        .from('marketplace_listings')
        .update(listingData)
        .eq('id', id)
        .eq('seller_id', user.id);

      if (listingError) throw listingError;

      // Handle image updates
      // First, delete removed existing images
      const remainingImageIds = existingImages.map(img => img.id);
      const { error: deleteError } = await supabase
        .from('marketplace_images')
        .delete()
        .eq('listing_id', id)
        .not('id', 'in', `(${remainingImageIds.join(',')})`);

      if (deleteError) {
        console.error('Error deleting images:', deleteError);
      }

      // Add new images
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${id}-${existingImages.length + i}-${Date.now()}.${fileExt}`;
          
          // For now, we'll store a placeholder URL since we don't have storage set up
          const imageUrl = imagePreviews[existingImages.length + i] || `/placeholder.svg`;

          const { error: imageError } = await supabase
            .from('marketplace_images')
            .insert({
              listing_id: id,
              image_url: imageUrl,
              is_primary: existingImages.length === 0 && i === 0, // First image is primary if no existing images
              alt_text: formData.title,
              display_order: existingImages.length + i + 1
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

                {/* Location Fields */}
                <LocationFields 
                  formData={{
                    location_country: formData.location_country,
                    location_state: formData.location_state,
                    location_city: formData.location_city,
                    postal_code: formData.postal_code,
                    street_address: formData.street_address
                  }}
                  onFieldChange={handleInputChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Image Upload & Actions */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Update photos of your item</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Image Previews with Carousel */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-4">
                      {imagePreviews.length === 1 ? (
                        <div className="relative">
                          <img
                            src={imagePreviews[0]}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(0)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Carousel className="w-full">
                          <CarouselContent>
                            {imagePreviews.map((preview, index) => (
                              <CarouselItem key={index}>
                                <div className="relative">
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          {imagePreviews.length > 1 && (
                            <>
                              <CarouselPrevious />
                              <CarouselNext />
                            </>
                          )}
                        </Carousel>
                      )}
                    </div>
                  )}

                  {/* Upload Area with Drag and Drop */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-4">
                      <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div>
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500">Choose files</span>
                          <span className="text-gray-600"> or drag and drop</span>
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                    </div>
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
