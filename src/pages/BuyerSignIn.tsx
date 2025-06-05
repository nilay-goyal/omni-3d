
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const BuyerSignIn = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      // Store user info in localStorage for MVP
      localStorage.setItem('userType', 'buyer');
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      navigate('/buyer-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-8">
          <Link to="/" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center">
            <Printer className="h-6 w-6 text-blue-600 mr-2" />
            <span className="text-lg font-semibold">Omni3D</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome, Buyer!</CardTitle>
            <CardDescription>
              Sign in to find local 3D printer owners and get your items printed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
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
              <Button type="submit" className="w-full" size="lg">
                Continue to Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerSignIn;
