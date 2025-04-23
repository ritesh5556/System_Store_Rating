import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      <h2 className="text-xl font-semibold mt-4 text-gray-700">Loading...</h2>
    </div>
  );
};

export default Loading; 