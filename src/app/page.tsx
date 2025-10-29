import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { 
  Home, 
  Flower2, 
  Users, 
  ShoppingCart, 
  BarChart3,
  Mail,
  Grid3X3,
  TrendingUp,
  Heart,
  Calendar
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      title: "Funeral Home Management",
      description: "Manage multiple funeral home locations with director information and chapel capacities.",
      icon: Home,
      href: "/funeral-homes"
    },
    {
      title: "Flower & Service Catalog",
      description: "Maintain your funeral service inventory with flowers, arrangements, and service packages.",
      icon: Flower2,
      href: "/products"
    },
    {
      title: "Florist & Vendor Network",
      description: "Build relationships with florists, caterers, and other funeral service providers.",
      icon: Users,
      href: "/suppliers"
    },
    {
      title: "Ceremony Planning",
      description: "Plan ceremonies and order flowers using our intuitive text-grid system.",
      icon: Calendar,
      href: "/ceremonies"
    },
    {
      title: "Flower Ordering",
      description: "Send flower orders via email to florists - perfect for traditional funeral businesses.",
      icon: Mail,
      href: "/orders"
    },
    {
      title: "Service Analytics",
      description: "Track ceremony performance and service quality with comprehensive reports.",
      icon: TrendingUp,
      href: "/dashboard"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
            Business Management
            <span className="text-blue-600"> Made Simple</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Streamline your business operations with our comprehensive management platform. 
            Manage stores, products, suppliers, and orders with our intuitive text-grid ordering system.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/orders">Create Order</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                <div className="flex-shrink-0">
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 group-hover:text-blue-700" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {feature.title}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Key Benefits */}
        <div className="mt-12 sm:mt-20 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Grid3X3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Text-Grid Ordering
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Intuitive grid interface with dropdowns and text fields for easy order creation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Email Integration
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Send orders via email to suppliers without requiring API access.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Complete Analytics
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Track performance with comprehensive reports and business insights.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
