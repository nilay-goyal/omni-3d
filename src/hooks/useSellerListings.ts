import { useState, useEffect, useCallback } from "react";
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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const fetchSellerListings = useCallback(async (pageNum = 0, reset = false) => {
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
          marketplace_images(image_url, is_primary)
        `)
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, pageNum * PAGE_SIZE + PAGE_SIZE - 1);

      if (error) throw error;
      const transformedData = (data || []).map(item => ({
        ...item,
        images: item.marketplace_images || []
      }));
      if (reset) {
        setListings(transformedData);
      } else {
        setListings(prev => [...prev, ...transformedData]);
      }
      setHasMore(transformedData.length === PAGE_SIZE);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching seller listings:', error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        variant: "destructive"
      });
      if (reset) setListings([]);
    } finally {
      setListingsLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (!loading && (!user || profile?.user_type !== 'seller')) {
      navigate('/seller-signin');
      return;
    }
    if (user && profile?.user_type === 'seller') {
      fetchSellerListings(0, true);
    }
    // eslint-disable-next-line
  }, [user, profile, loading]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!hasMore || listingsLoading) return;
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const fullHeight = document.body.offsetHeight;
    if (scrollY + viewportHeight + 200 > fullHeight) {
      fetchSellerListings(page + 1);
    }
  }, [hasMore, listingsLoading, page, fetchSellerListings]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const deleteListing = useCallback(async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId)
        .eq('seller_id', user?.id);

      if (error) throw error;

      setListings(prev => prev.filter(listing => listing.id !== listingId));
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
  }, [user?.id, toast]);

  const toggleListingStatus = useCallback(async (listingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ is_active: !currentStatus })
        .eq('id', listingId)
        .eq('seller_id', user?.id);

      if (error) throw error;

      setListings(prev => prev.map(listing => 
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
  }, [user?.id, toast]);

  return {
    listings,
    listingsLoading,
    loading,
    profile,
    deleteListing,
    toggleListingStatus
  };
};