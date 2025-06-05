
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const SellerSignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let result;
      if (isSignUp) {
        if (!name) {
          toast({
            title: "Error",
            description: "Please enter your full name.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        result = await signUp(email, password, name, 'seller');
      } else {
        result = await signIn(email, password);
      }
      
      if (result.error) {
        console.error('Auth error:', result.error);
        toast({
          title: "Error",
          description: result.error.message || "An error occurred during authentication.",
          variant: "destructive"
        });
      } else {
        if (isSignUp) {
          toast({
            title: "Success",
            description: "Account created! Please check your email to verify your account.",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
          navigate('/seller-dashboard');
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-8">
          <Link to="/" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center">
            <Printer className="h-6 w-6 text-green-600 mr-2" />
            <span className="text-lg font-semibold">Omni3D</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? "Join as a Seller!" : "Welcome Back, Seller!"}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Create an account to offer your 3D printing services to the local community."
                : "Sign in to offer your 3D printing services to the local community."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-green-600 hover:underline"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerSignIn;
