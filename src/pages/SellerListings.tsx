
import { useState } from "react";
import { useSellerListings } from "@/hooks/useSellerListings";
import SellerListingsNavigation from "@/components/SellerListingsNavigation";
import SellerListingsHeader from "@/components/SellerListingsHeader";
import SellerListingCard from "@/components/SellerListingCard";
import SellerListingsEmptyState from "@/components/SellerListingsEmptyState";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

const SellerListings = () => {
  const { 
    listings, 
    listingsLoading, 
    loading, 
    profile, 
    deleteListing, 
    toggleListingStatus 
  } = useSellerListings();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  const handleDeleteClick = (listingId: string) => {
    setListingToDelete(listingId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return;

    await deleteListing(listingToDelete);
    setDeleteDialogOpen(false);
    setListingToDelete(null);
  };

  if (loading && listings.length === 0) {
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
      <SellerListingsNavigation profileName={profile?.full_name} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SellerListingsHeader />

        {listings.length === 0 ? (
          <SellerListingsEmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <SellerListingCard
                key={listing.id}
                listing={listing}
                onDelete={handleDeleteClick}
                onToggleStatus={toggleListingStatus}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default SellerListings;
