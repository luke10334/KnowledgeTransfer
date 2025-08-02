import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Shield,
  User
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, children, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
  >
    <Icon className="mr-3 h-5 w-5" />
    {children}
    {badge && (
      <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
        {badge}
      </span>
    )}
  </NavLink>
);

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex-1 py-6 px-4 space-y-1">
        {/* Main Navigation */}
        <nav className="space-y-1">
          <NavItem to="/dashboard" icon={Home}>
            Dashboard
          </NavItem>
          
          <NavItem to="/knowledge" icon={FileText}>
            Knowledge Base
          </NavItem>
          
          <NavItem to="/chat" icon={MessageSquare}>
            AI Assistant
          </NavItem>
        </nav>

        {/* User Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="px-3 py-2">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Your Access Level
              </span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900">
                {user.role}
              </p>
              <p className="text-xs text-gray-500">
                Access Level: {user.level}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
