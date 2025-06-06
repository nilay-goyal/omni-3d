
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface SellerListing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location_city: string;
  location_state: string;
  is_active: boolean;
  featured: boolean;
  views_count: number;
  created_at: string;
  images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

export const useSellerListings = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.user_type !== 'seller')) {
      navigate('/seller-signin');
      return;
    }
    
    if (user && profile?.user_type === 'seller') {
      fetchSellerListings();
    }
  }, [user, profile, loading, navigate]);

  const fetchSellerListings = async () => {
    try {
      setListingsLoading(true);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          id,
          title,
          description,
          price,
          condition,
          location_city,
          location_state,
          is_active,
          featured,
          views_count,
          created_at,
          images:marketplace_images(image_url, is_primary)
        `)
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching seller listings:', error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        variant: "destructive"
      });
    } finally {
      setListingsLoading(false);
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      setListings(listings.filter(listing => listing.id !== listingId));
      toast({
        title: "Success",
        description: "Listing deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive"
      });
    }
  };

  const toggleListingStatus = async (listingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ is_active: !currentStatus })
        .eq('id', listingId);

      if (error) throw error;

      setListings(listings.map(listing => 
        listing.id === listingId 
          ? { ...listing, is_active: !currentStatus }
          : listing
      ));

      toast({
        title: "Success",
        description: `Listing ${!currentStatus ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      console.error('Error updating listing status:', error);
      toast({
        title: "Error",
        description: "Failed to update listing status",
        variant: "destructive"
      });
    }
  };

  return {
    listings,
    listingsLoading,
    loading,
    profile,
    deleteListing,
    toggleListingStatus
  };
};
