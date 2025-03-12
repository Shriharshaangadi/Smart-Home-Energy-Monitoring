import { Link, useLocation } from "wouter";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'fa-home' },
    { name: 'Devices', path: '/devices', icon: 'fa-bolt' },
    { name: 'Analytics', path: '/analytics', icon: 'fa-chart-line' },
    { name: 'Alerts', path: '/alerts', icon: 'fa-bell' },
    { name: 'Settings', path: '/settings', icon: 'fa-cog' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-40 md:hidden bg-gray-600 bg-opacity-75 transition-opacity`} 
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 transition duration-300 ease-in-out transform 
                  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                  md:translate-x-0 bg-white border-r border-gray-200 md:static md:inset-auto md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="pt-5 pb-4 md:hidden px-4 flex items-center justify-between">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-leaf text-primary mr-2 text-xl"></i>
              <span className="text-xl font-semibold text-primary">EcoTrack</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="md:hidden rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="mt-5 flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                href={item.path}
                className={`
                  ${isActive(item.path) 
                    ? 'bg-primary-light bg-opacity-10 text-primary-dark' 
                    : 'text-gray-700 hover:bg-gray-100'
                  } 
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md
                `}
              >
                <i className={`fas ${item.icon} mr-3 ${isActive(item.path) ? 'text-primary' : 'text-gray-500'}`}></i>
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Logout section */}
          <div className="p-4 border-t border-gray-200">
            <button 
              className="text-gray-700 hover:bg-gray-100 group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full"
              onClick={() => {
                fetch('/api/auth/logout', { 
                  method: 'POST',
                  credentials: 'include'
                }).then(() => {
                  window.location.href = '/login';
                });
              }}
            >
              <i className="fas fa-sign-out-alt mr-3 text-gray-500"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
