import { ChevronDown, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import EmailVerificationBanner from "./EmailVerificationBanner";

const Header = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { canManagePuzzles, canManageUsers } = useAdmin();

  const getLinkClasses = (path: string) => {
    const isActive = location.pathname === path;
    return `flex h-10 items-center px-4 rounded-full transition-all duration-300 ${
      isActive
        ? "bg-white/20 text-white backdrop-blur-sm shadow-lg"
        : "hover:text-blue-200"
    }`;
  };
  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="https://live.staticflickr.com/65535/54710883758_df5e40760b_b.jpg"
              alt="Math Club Logo"
              className="h-8 w-8 rounded-full object-cover"
            />
            <Link to="/" className="text-2xl font-bold">
              Students United by Mathematics
            </Link>
          </div>
          <nav className="hidden items-center space-x-2 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex h-10 items-center text-white hover:bg-transparent hover:text-blue-200 px-4 rounded-full transition-all duration-300 ${
                    location.pathname.startsWith("/events")
                      ? "bg-white/20 backdrop-blur-sm shadow-lg"
                      : ""
                  }`}
                >
                  Events <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 bg-white text-black">
                <DropdownMenuItem>
                  <Link to="/events" className="w-full">
                    Recent Events
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/about" className={getLinkClasses("/about")}>
              About Us
            </Link>
            <Link to="/contests" className={getLinkClasses("/contests")}>
              Contests
            </Link>
            <Link
              to="/problem-of-the-week"
              className={getLinkClasses("/problem-of-the-week")}
            >
              POTW
            </Link>
            <Link to="/contact" className={getLinkClasses("/contact")}>
              Contact Us
            </Link>
            
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex h-10 items-center text-white hover:bg-transparent hover:text-blue-200 px-4 rounded-full transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-50 bg-white text-black">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {canManagePuzzles && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/puzzles" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Puzzle Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {canManageUsers && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        User Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className={getLinkClasses("/login")}>
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
      </header>
      <EmailVerificationBanner />
    </>
  );
};

export default Header;
