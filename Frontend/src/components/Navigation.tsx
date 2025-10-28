import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, Menu, X, Home, Users, Settings, BarChart3 } from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: Home },
    { label: "Workers", path: "/workerlist", icon: Users },
    { label: "Manage Login", path: "/manage-login", icon: Settings },
    { label: "Report", path: "/report", icon: BarChart3 },
  ];

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/");
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMenuOpen(false);
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && menuOpen) {
        const sidebar = document.querySelector('.mobile-sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, menuOpen]);

  return (
    <>
      {/* Main Navigation Bar - Always on top */}
      <nav className="bg-black text-gray-300 sticky top-0 z-50 px-4">
        <div className="flex justify-between h-14 items-center">
          {/* Left side - Navigation modules and mobile menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button - Only show on mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            
            {/* Brand/Logo - Show only on mobile */}
            <div className="md:hidden text-white font-bold text-lg">
              Admin
            </div>

            {/* Desktop Navigation - Moved to left corner */}
            <div className="hidden md:flex space-x-6 items-center">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`transition-colors ${
                    location.pathname === item.path 
                      ? "text-white font-medium" 
                      : "hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - User & Logout - Desktop only */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="hover:text-white transition-colors flex items-center space-x-1"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>

            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-black" />
            </div>
          </div>

          {/* Empty div for mobile to maintain flex spacing */}
          <div className="md:hidden w-6"></div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay - Only for mobile */}
      {isMobile && menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <div 
            className="mobile-sidebar fixed left-0 top-0 h-full w-64 bg-black text-gray-300 z-50 transform transition-transform duration-300 ease-in-out"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="text-white font-bold text-lg">Admin Panel</div>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sidebar Navigation Items */}
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                      location.pathname === item.path 
                        ? "bg-gray-800 text-white font-medium" 
                        : "hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Admin User</div>
                  <div className="text-gray-400 text-xs">Administrator</div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-800 hover:text-white transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;