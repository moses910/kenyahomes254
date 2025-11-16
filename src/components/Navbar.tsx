import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Heart, LayoutDashboard, LogOut, Menu, X, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:inline-block">KenyaHomes</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {profile?.role === 'agent' && (
                <Button variant="ghost" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Dashboard
                  </Link>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <Link to="/favourites">
                  <Heart className="mr-2 h-4 w-4" />
                  Favourites
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {profile?.name || user.email}
                    <div className="text-xs text-muted-foreground capitalize">
                      {profile?.role}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">List Property</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-2">
          {user ? (
            <>
              {profile?.role === 'agent' && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Dashboard
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/favourites">
                  <Heart className="mr-2 h-4 w-4" />
                  Favourites
                </Link>
              </Button>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground px-2 pb-2">
                  {profile?.name || user.email}
                </p>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="w-full"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button
                className="w-full"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/auth">List Property</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
