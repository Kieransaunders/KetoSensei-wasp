import { Link } from "wasp/client/router";
import { useAuth, logout } from "wasp/client/auth";
import { Outlet } from "react-router-dom";
import "./Main.css";
import * as Sentry from "@sentry/react";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Initialize Sentry as early as possible
Sentry.init({
  dsn: "https://303c875e64a5b5d1c60d8af7a8ba9995@o4509537295532033.ingest.de.sentry.io/4509615461171280",
  _experiments: {
    enableLogs: true,
  },
});

export const Layout = () => {
  const { data: user } = useAuth();

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-900">
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-lime-400 hover:text-lime-300 transition-colors">
                KetoSensei
              </h1>
            </Link>
            
            {/* Navigation Menu - only show when user is logged in */}
            {user && (
              <nav className="hidden md:flex space-x-1">
                <Link to="/" className="px-4 py-2 text-gray-300 hover:text-lime-400 hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium">
                  Dashboard
                </Link>
                <Link to="/meal-planning" className="px-4 py-2 text-gray-300 hover:text-lime-400 hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium">
                  Meal Planning
                </Link>
                <Link to="/recipes" className="px-4 py-2 text-gray-300 hover:text-lime-400 hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium">
                  Recipe Library
                </Link>
                <Link to="/sensei" className="px-4 py-2 text-gray-300 hover:text-lime-400 hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium">
                  Ask Sensei
                </Link>
                <Link to="/preferences" className="px-4 py-2 text-gray-300 hover:text-lime-400 hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium">
                  Preferences
                </Link>
              </nav>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-sm">
                      {user.identities.username?.id.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-300 hidden sm:inline">
                    Hi, <span className="font-medium text-lime-400">{user.identities.username?.id}</span>!
                  </span>
                </div>
                <button 
                  onClick={logout} 
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 font-medium"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-lime-400 hover:text-lime-300 font-medium transition-colors duration-200"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 text-gray-900 bg-lime-400 hover:bg-lime-300 rounded-lg transition-colors duration-200 font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </header>
        <main className="container mx-auto px-6 py-8 flex-grow">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
          <div className="container mx-auto px-6 py-4">
            <p className="text-center text-gray-400 text-sm">
              KetoSensei ~ Powered by Wasp
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};
