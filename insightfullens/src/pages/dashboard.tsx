import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authAxios, logoutUser, isAuthenticated, debugTokenInfo } from '../api/authservice';

interface User {
  id: string;
  username: string;
}

interface TokenDebugInfo {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  accessTokenStart?: string;
  refreshTokenStart?: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [tokenDebugInfo, setTokenDebugInfo] = useState<TokenDebugInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // First check if user is authenticated
    if (!isAuthenticated()) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    // For debugging - show token information
    setTokenDebugInfo(debugTokenInfo());

    const fetchUserData = async () => {
      try {
        console.log('Fetching user profile data...');
        const response = await authAxios.get('/auth/profile/');
        console.log('User profile response:', response.data);
        setUser(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try logging in again.');
        
        // Only redirect for auth errors, not all errors
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          console.log('Authentication error in component, redirecting');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header/Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex items-center">
              {user && (
                <span className="mr-4 text-gray-600">
                  Welcome, <span className="font-medium text-gray-800">{user.username}</span>
                </span>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Debug Information - Remove in production */}
        {tokenDebugInfo && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <h3 className="font-bold">Debug Info:</h3>
            <pre className="text-xs mt-1">
              {JSON.stringify(tokenDebugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Account</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{user?.username}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">Active</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Last Login</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">Just now</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Protected Dashboard Content
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This section is only visible to authenticated users.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="text-md font-medium text-gray-800 mb-2">User Information</h4>
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Username:</strong> {user?.username}</p>
              <p className="mt-4 text-sm text-gray-500">
                You've successfully authenticated with JWT. Your tokens are stored in localStorage
                and will be sent with any API requests requiring authentication.
              </p>
            </div>
            
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-800 mb-2">What You Can Do Now</h4>
              <ul className="list-disc pl-5 text-gray-600">
                <li className="mb-1">Access protected API endpoints</li>
                <li className="mb-1">Manage your user profile</li>
                <li className="mb-1">Create and manage content</li>
                <li>View personalized data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;