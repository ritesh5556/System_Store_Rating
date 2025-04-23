import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-4 max-w-md">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <button className="mt-8 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-300">
            Go to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 