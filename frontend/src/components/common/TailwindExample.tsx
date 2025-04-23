import React from 'react';

const TailwindExample: React.FC = () => {
    return (
        <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
            <div className="shrink-0">
                <svg className="h-12 w-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
            </div>
            <div>
                <div className="text-xl font-medium text-black">Store Rating System</div>
                <p className="text-gray-500">Rate and review your favorite stores!</p>
            </div>
        </div>
    );
};

export default TailwindExample; 