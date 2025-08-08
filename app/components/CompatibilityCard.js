import React from 'react';

const CompatibilityCard = ({ name, imgUrl, personalityMatch, compatibilityScore }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 lg:p-12 w-full max-w-6xl mx-auto flex flex-col"> {/* Increased width */}
      <h2 className="text-4xl font-semibold text-gray-800 text-center">Your Compatibility with</h2>
      <h3 className="text-3xl font-bold mt-2 text-center">{name}</h3>

      <div className="flex flex-col sm:flex-row justify-center items-center mt-6">
        {/* Image Section */}
        <div className="flex justify-center mb-4 sm:mb-0 sm:w-1/3">
          <img 
            className="rounded-lg object-cover w-60 h-60 md:w-72 md:h-72" 
            src={imgUrl} 
            alt={`Profile of ${name}`} 
          />
        </div>

        {/* Compatibility Info */}
        <div className="mt-6 sm:mt-0 sm:ml-12 sm:w-2/3 text-center sm:text-left">
          <div className="bg-gradient-to-r from-red-400 to-orange-400 text-white p-8 rounded-md shadow-lg">
            <h4 className="text-xl font-bold mb-2">Your Result</h4>
            {/* <p className="text-xl">Personality Match: <span className="font-semibold">{personalityMatch}%</span></p> */}
            <p className="text-xl mt-2">Compatibility: <span className="font-semibold">{compatibilityScore}%</span></p>
          </div>

          {/* Button */}
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded mt-8">
            Compatibility Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityCard;
