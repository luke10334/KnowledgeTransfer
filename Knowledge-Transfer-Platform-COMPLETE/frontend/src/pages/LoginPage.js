import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Building2, Lock, User } from 'lucide-react';

const DEMO_USERS = [
  { username: 'demo_ceo', role: 'CEO', description: 'Full access to all company data' },
  { username: 'demo_engineer', role: 'Engineer', description: 'Standard technical access' },
  { username: 'demo_intern', role: 'Intern', description: 'Learning access only' },
];

const LoginPage = () => {
  const { user, login, loading } = useAuth();
  const [loginType, setLoginType] = useState('demo'); // 'demo' or 'manual'
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Redirect if already logged in
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleManualLogin = async (e) => {
    e.preventDefault();
    try {
      await login(formData.username, formData.password);
    } catch (error) {
      // Error handling is done in AuthContext
    }
  };

  const handleDemoLogin = async (username) => {
    try {
      await login(username, 'demo123');
    } catch (error) {
      // Error handling is done in AuthContext
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Knowledge Transfer Platform</p>
        </div>

        {/* Login Type Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLoginType('demo')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === 'demo'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Demo Login
          </button>
          <button
            type="button"
            onClick={() => setLoginType('manual')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === 'manual'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Manual Login
          </button>
        </div>

        {loginType === 'demo' ? (
          /* Demo Login */
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Choose Your Role
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select a role to see role-based access control in action
              </p>
            </div>
            
            <div className="grid gap-3">
              {DEMO_USERS.map((demoUser) => (
                <button
                  key={demoUser.username}
                  onClick={() => handleDemoLogin(demoUser.username)}
                  disabled={loading}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
                >
                  <div className="flex-shrink-0 mr-3">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {demoUser.role}
                    </div>
                    <div className="text-sm text-gray-600">
                      {demoUser.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Username: {demoUser.username} | Password: demo123
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Manual Login Form */
          <form onSubmit={handleManualLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Demo mode • Role-based access control demonstration
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
