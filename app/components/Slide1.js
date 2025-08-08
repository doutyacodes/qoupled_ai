import React, { useState } from "react";

const Slide1 = ({ nextSlide, setFormData }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  const options = ["Myself", "My Son", "My Daughter", "My Friend", "My Sibling"];

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setFormData((prevData) => ({
      ...prevData,
      accountFor: option,
    }));
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-red-500 to-orange-500 p-4">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          For whom are you creating this account?
        </h2>
        <div className="relative mb-6">
          <div
            className="bg-orange-200 border border-orange-400 p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:bg-orange-300"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedOption || "Select an Option"}
            <span className="float-right transform transition-transform duration-200" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>&#x25BC;</span> {/* Down Arrow Icon */}
          </div>
          {isDropdownOpen && (
            <div className="absolute w-full bg-white border border-orange-300 rounded-lg mt-2 z-10 shadow-lg">
              {options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className="p-3 hover:bg-orange-100 transition-colors duration-200 cursor-pointer"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={nextSlide}
          disabled={!selectedOption} // Disable Next button until an option is selected
          className={`mt-8 py-3 px-6 rounded-lg transition duration-300 ${
            selectedOption
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Slide1;
