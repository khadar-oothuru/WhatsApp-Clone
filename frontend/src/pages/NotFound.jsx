import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaArrowLeft } from "react-icons/fa";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-wa-bg flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="mb-8">
          <div className="text-6xl mb-4">🤷‍♂️</div>
          <h1 className="text-4xl font-bold text-wa-text mb-2">404</h1>
          <h2 className="text-xl font-semibold text-wa-text mb-4">
            Page Not Found
          </h2>
          <p className="text-wa-text-secondary mb-8">
            Oops! The page you're looking for doesn't exist. It might have been
            moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/chat")}
            className="w-full flex items-center justify-center px-6 py-3 bg-wa-primary text-white rounded-lg hover:bg-wa-primary-dark transition-colors"
          >
            <FaHome className="mr-2" />
            Go to Chat
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center px-6 py-3 border border-wa-border text-wa-text rounded-lg hover:bg-wa-input-panel transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-8 text-sm text-wa-text-secondary">
          <p>If you think this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
