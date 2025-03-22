
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Home,
  LayoutDashboard,
  Users,
  FileText,
  User,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Motion } from '@/components/ui/motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NavItems = [
  {
    name: 'Home',
    path: '/',
    icon: <Home className="w-5 h-5" />,
    authRequired: false,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    authRequired: true,
  },
  {
    name: 'Community',
    path: '/community',
    icon: <Users className="w-5 h-5" />,
    authRequired: true,
  },
  {
    name: 'Services',
    path: '/services',
    icon: <FileText className="w-5 h-5" />,
    authRequired: true,
  },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Track scrolling for navbar background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6 md:px-8",
        isScrolled 
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-sm" 
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Motion fadeIn>
            <div className="bg-nyika-500 text-white font-bold p-2 rounded-md">NN</div>
          </Motion>
          <Motion fadeIn delay={100}>
            <span className="font-semibold text-lg tracking-tight">Nyika Nexus</span>
          </Motion>
        </Link>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-1">
          {NavItems.map((item, index) => {
            // If auth is required for this route but user is not authenticated, don't show it
            if (item.authRequired && !isAuthenticated) return null;
            
            return (
              <Motion key={item.path} fadeIn delay={100 + (index * 50)}>
                <li>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === item.path
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              </Motion>
            );
          })}
        </ul>
        
        {/* Auth / Profile */}
        <Motion fadeIn delay={300}>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-9 w-9 p-0">
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:block">
                <Link to="/auth">
                  <Button variant="default" size="sm">Sign In</Button>
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </Motion>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <Motion
            fadeInDown
            className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg rounded-b-lg mt-0 overflow-hidden glass-effect"
          >
            <ul className="py-2 px-4">
              {NavItems.map((item) => {
                if (item.authRequired && !isAuthenticated) return null;
                
                return (
                  <li key={item.path} className="mb-1">
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-md text-base transition-colors",
                        location.pathname === item.path
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
              
              {!isAuthenticated && (
                <li className="mt-3 mb-1">
                  <Link
                    to="/auth"
                    className="block w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full">Sign In</Button>
                  </Link>
                </li>
              )}
            </ul>
          </Motion>
        )}
      </nav>
    </header>
  );
}
