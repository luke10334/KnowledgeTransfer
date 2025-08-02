import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from 'react-query';
import { apiService } from '../services/apiService';
import { 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Users,
  Shield,
  Clock,
  BookOpen
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  </div>
);

const RecentArtifact = ({ artifact }) => (
  <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
    <div className="flex-shrink-0 mr-3">
      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
        <FileText className="w-4 h-4 text-blue-600" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">
        {artifact.title}
      </p>
      <p className="text-sm text-gray-500 truncate">
        {artifact.type} • Level {artifact.access_level}+
      </p>
    </div>
    <div className="flex-shrink-0">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Accessible
      </span>
    </div>
  </div>
);

const AccessLevelInfo = ({ user }) => {
  const getAccessInfo = (level) => {
    if (level >= 80) return { level: 'Executive', color: 'text-purple-600', description: 'Strategic and confidential information' };
    if (level >= 60) return { level: 'Senior', color: 'text-blue-600', description: 'Advanced technical and management content' };
    if (level >= 30) return { level: 'Professional', color: 'text-green-600', description: 'Standard technical documentation' };
    return { level: 'Entry', color: 'text-gray-600', description: 'Learning and onboarding materials' };
  };

  const accessInfo = getAccessInfo(user.level);

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <Shield className="w-5 h-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Your Access Level</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Current Level</span>
            <span className={`text-lg font-semibold ${accessInfo.color}`}>
              {accessInfo.level}
            </span>
          </div>
          <div className="mt-1">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Access Score</span>
              <span>{user.level}/100</span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${user.level}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">{accessInfo.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            You can access content with access level {user.level} and below
          </p>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();

  // Fetch accessible artifacts
  const { data: artifactsData, isLoading } = useQuery(
    'dashboard-artifacts',
    () => apiService.getArtifacts(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const artifacts = artifactsData?.artifacts || [];

  // Calculate stats based on user level
  const stats = [
    {
      title: 'Accessible Articles',
      value: artifacts.length,
      icon: FileText,
      color: 'bg-blue-500',
      description: `Out of ${artifacts.length + Math.floor(artifacts.length * 0.5)} total`
    },
    {
      title: 'Your Access Level',
      value: user.level,
      icon: Shield,
      color: 'bg-green-500',
      description: 'Security clearance level'
    },
    {
      title: 'AI Assistance',
      value: 'Active',
      icon: MessageSquare,
      color: 'bg-purple-500',
      description: 'Role-aware responses'
    },
    {
      title: 'Account Status',
      value: 'Active',
      icon: TrendingUp,
      color: 'bg-orange-500',
      description: 'Full platform access'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.full_name}!
        </h1>
        <p className="text-gray-600">
          Here's your personalized knowledge management dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Knowledge Articles
              </h3>
              <p className="text-sm text-gray-600">
                Articles you can access based on your role
              </p>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center p-4 bg-gray-100 rounded-lg">
                        <div className="w-8 h-8 bg-gray-300 rounded-md mr-3"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : artifacts.length > 0 ? (
                <div className="space-y-3">
                  {artifacts.slice(0, 5).map((artifact) => (
                    <RecentArtifact key={artifact.id} artifact={artifact} />
                  ))}
                  {artifacts.length > 5 && (
                    <div className="text-center pt-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View all {artifacts.length} articles →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No articles available
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No knowledge articles match your current access level.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Access Level Info */}
        <div className="lg:col-span-1">
          <AccessLevelInfo user={user} />
          
          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center px-4 py-2 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <MessageSquare className="w-4 h-4 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-blue-700">
                  Ask AI Assistant
                </span>
              </button>
              <button className="w-full flex items-center px-4 py-2 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <FileText className="w-4 h-4 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-700">
                  Browse Knowledge Base
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
