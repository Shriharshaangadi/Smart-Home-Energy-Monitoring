import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";

interface NavbarProps {
  setSidebarOpen: (open: boolean) => void;
}

const Navbar = ({ setSidebarOpen }: NavbarProps) => {
  const [hasNotifications, setHasNotifications] = useState(true);

  // Get current user
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
    onError: () => {
      // If error fetching user, fallback to demo user
      return {
        id: 1,
        username: 'demo',
        name: 'Shri Harsha Angadi',
        email: 'shriharsha@example.com',
        password: '' // We don't actually use this client-side
      };
    }
  });

  const userInitials = user?.name ? 
    user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
    'SHA';

  return (
    <nav className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-leaf text-primary mr-2 text-xl"></i>
              <span className="text-xl font-semibold text-primary">EcoTrack</span>
            </div>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
              >
                <i className="fas fa-bell"></i>
                {hasNotifications && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-error rounded-full"></span>
                )}
              </Button>
            </div>
            <div className="relative ml-3">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <span>{userInitials}</span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{user?.name || 'Shri Harsha Angadi'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
