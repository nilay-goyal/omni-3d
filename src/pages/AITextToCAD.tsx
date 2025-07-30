import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bot, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

const AITextToCAD = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-xl font-bold text-gray-900">AI Text to CAD</h1>
            <div></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <Bot className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              AI Text to CAD
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your ideas into 3D models with the power of artificial intelligence
            </p>
          </div>

          {/* Under Construction Card */}
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader className="pb-6">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Under Construction</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg mb-6">
                We're working hard to bring you an amazing AI-powered text-to-CAD experience. 
                This feature will allow you to describe what you want in plain English and 
                our AI will generate 3D models for you.
              </CardDescription>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Coming Soon Features:</h3>
                <ul className="text-left text-blue-800 space-y-2">
                  <li>• Natural language to 3D model conversion</li>
                  <li>• Instant STL file generation</li>
                  <li>• Customizable design parameters</li>
                  <li>• Integration with local printers</li>
                </ul>
              </div>

              <p className="text-gray-600 mb-6">
                Stay tuned for updates! In the meantime, you can upload your existing STL files 
                or browse our marketplace for available designs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/upload-file">
                  <Button size="lg" className="w-full sm:w-auto">
                    Upload STL Files
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AITextToCAD;