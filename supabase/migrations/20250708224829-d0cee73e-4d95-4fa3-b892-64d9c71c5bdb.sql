
-- Create a table to track sale confirmations between buyers and sellers
CREATE TABLE public.sale_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  seller_confirmed BOOLEAN NOT NULL DEFAULT false,
  buyer_confirmed BOOLEAN NOT NULL DEFAULT false,
  sale_completed BOOLEAN NOT NULL DEFAULT false,
  seller_confirmed_at TIMESTAMP WITH TIME ZONE,
  buyer_confirmed_at TIMESTAMP WITH TIME ZONE,
  sale_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, buyer_id, seller_id)
);

-- Enable Row Level Security
ALTER TABLE public.sale_confirmations ENABLE ROW LEVEL SECURITY;

-- Create policies for sale confirmations
CREATE POLICY "Users can view their own sale confirmations" 
  ON public.sale_confirmations 
  FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create sale confirmations" 
  ON public.sale_confirmations 
  FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own sale confirmations" 
  ON public.sale_confirmations 
  FOR UPDATE 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Add trigger to update the updated_at column
CREATE TRIGGER update_sale_confirmations_updated_at
  BEFORE UPDATE ON public.sale_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
