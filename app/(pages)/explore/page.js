import React from 'react';
import Link from 'next/link';
import ModernNavbar from '@/app/_components/Navbar';

const ExplorePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex flex-col justify-center items-center">
      {/* Navbar */}
       {/* <ModernNavbar /> */}

      {/* Thin Line */}
      <div className="w-full flex justify-center mt-1" style={{ marginTop: '85px' }}> {/* Adjusted margin to align the line */}
        <div className="w-full max-w-6xl">
          <div className="w-full h-1 bg-white" />
        </div>
      </div>

      {/* Card Layout */}
      <div className="bg-white rounded-lg shadow-lg p-10 mt-4 max-w-6xl w-full">
        {/* Content Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black">EXPLORE</h1>
          <p className="text-gray-600 mt-2">Apply or Remove Filters by clicking on the buttons</p>

          {/* Filters Section */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button className="bg-orange-500 text-white px-4 py-2 rounded">
              Personality Filter <br />Min Score - 80%
            </button>
            <button className="bg-orange-500 text-white px-4 py-2 rounded">
              Preferences Filter <br />Min Score - 5
            </button>
            <button className="bg-orange-500 text-white px-4 py-2 rounded">
              Religion Filter <br />Exact Caste Match
            </button>
            <button className="bg-orange-500 text-white px-4 py-2 rounded">
              Education Filter <br />Any Degree
            </button>
            <button className="bg-orange-500 text-white px-4 py-2 rounded">
              Occupation Filter <br />Multiple Filters
            </button>
            <button className="bg-orange-500 text-white px-4 py-2 rounded">
              Physical Features Filter <br />Multiple Filters
            </button>
            <button className="bg-orange-500 text-white px-4 py-2 rounded">
              Language Filter <br />Kannada, English
            </button>
            <button className="bg-orange-500 text-white px-4 py-2 rounded">
              Location Filter <br />Any Location
            </button>
          </div>

          {/* Suitable Matches Section */}
          <div className="mt-10">
            <h2 className="text-4xl font-bold text-black">356</h2>
            <p className="text-lg text-gray-700">Suitable Matches</p>
            <button className="mt-6 bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition duration-300">
              START EXPLORING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
