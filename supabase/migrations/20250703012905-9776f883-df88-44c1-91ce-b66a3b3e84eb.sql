-- Allow buyers to view seller profiles for the map
CREATE POLICY "Buyers can view seller profiles" 
ON public.profiles 
FOR SELECT 
USING (user_type = 'seller');

-- Allow sellers to view all profiles (for messaging)
CREATE POLICY "Sellers can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);