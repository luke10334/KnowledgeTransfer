import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from 'react-query';
import { apiService } from '../services/apiService';
import { 
  Search, 
  FileText, 
  Filter,
  Eye,
  Clock,
  Shield,
  Tag
} from 'lucide-react';

const KnowledgeCard = ({ artifact }) => {
  const getTypeColor = (type) => {
    const colors = {
      'DOCUMENTATION': 'bg-blue-100 text-blue-800',
      'ARCHITECTURE_DOC': 'bg-purple-100 text-purple-800',
      'STRATEGY': 'bg-red-100 text-red-800',
      'HR_DOCUMENT': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:border-blue-300 transition-colors p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {artifact.title}
        </h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(artifact.type)}`}>
          {artifact.type.replace(/_/g, ' ')}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {artifact.content}
      </p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {artifact.created_at}
          </div>
        </div>
        <div className="flex items-center">
          <Shield className="w-4 h-4 mr-1" />
          Level {artifact.access_level}+
        </div>
      </div>
      
      {artifact.tags && artifact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {artifact.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {artifact.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{artifact.tags.length - 3} more</span>
          )}
        </div>
      )}
      
      <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md transition-colors">
        View Article
      </button>
    </div>
  );
};

const SearchBar = ({ searchTerm, onSearchChange, onSearch }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && onSearch()}
      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      placeholder="Search knowledge base..."
    />
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
      <button
        onClick={onSearch}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md text-sm font-medium transition-colors"
      >
        Search
      </button>
    </div>
  </div>
);

const FilterPanel = ({ filters, onFilterChange }) => {
  const artifactTypes = [
    { value: 'DOCUMENTATION', label: 'Documentation' },
    { value: 'ARCHITECTURE_DOC', label: 'Architecture' },
    { value: 'STRATEGY', label: 'Strategy' },
    { value: 'HR_DOCUMENT', label: 'HR Document' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {artifactTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const KnowledgePage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: ''
  });

  // Fetch artifacts
  const { data: artifactsData, isLoading: artifactsLoading } = useQuery(
    ['artifacts', filters],
    () => apiService.getArtifacts(filters),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch search results when searchQuery changes
  const { data: searchResults, isLoading: searchLoading } = useQuery(
    ['search', searchQuery],
    () => searchQuery ? apiService.search(searchQuery) : Promise.resolve({ results: [] }),
    {
      enabled: !!searchQuery,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  );

  const handleSearch = () => {
    setSearchQuery(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const displayData = searchQuery ? searchResults?.results || [] : artifactsData?.artifacts || [];
  const isLoading = searchQuery ? searchLoading : artifactsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">
            Discover and access knowledge based on your role ({user.role})
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
      />

      {/* Results Summary */}
      {searchQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800">
            {searchLoading ? 'Searching...' : `Found ${displayData.length} results for "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          
          {/* User Access Info */}
          <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Access</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Level:</span>
                <span className="font-medium">{user.level}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  You can access content with level {user.level} and below
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse border border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : displayData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayData.map((artifact) => (
                <KnowledgeCard
                  key={artifact.id}
                  artifact={artifact}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchQuery ? 'No results found' : 'No articles available'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters'
                  : 'No knowledge articles match your current access level'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgePage;
