import React, { useState } from "react";

const LocationForm = ({ formData, setFormData, handleBackToSignup }) => {
  const [currentAddress, setCurrentAddress] = useState({
    city: "",
    state: "",
    country: "",
  });
  const [permanentAddress, setPermanentAddress] = useState({
    city: "",
    state: "",
    country: "",
  });
  const [sameAsCurrent, setSameAsCurrent] = useState(false);

  const countriesAndStates = {
    India: {
      "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Dadar", "Dombivali", "Kalyan"],
      "Karnataka": ["Bengaluru", "Mysuru", "Mangalore"],
      "Delhi": ["New Delhi", "Old Delhi", "Noida"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
      "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
      "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
      // Add more states and corresponding cities as needed
    },
    USA: {
      "California": ["Los Angeles", "San Francisco", "San Diego"],
      "Texas": ["Houston", "Dallas", "Austin"],
      "New York": ["New York City", "Buffalo", "Rochester"],
      // Add more states and corresponding cities as needed
    },
    // Add more countries as needed
  };

  const handleAddressChange = (e, type) => {
    if (type === "current") {
      setCurrentAddress({ ...currentAddress, [e.target.name]: e.target.value });
    } else {
      setPermanentAddress({ ...permanentAddress, [e.target.name]: e.target.value });
    }
  };

  const handleCheckboxChange = () => {
    setSameAsCurrent(!sameAsCurrent);
    if (!sameAsCurrent) {
      setPermanentAddress(currentAddress);
    } else {
      setPermanentAddress({ city: "", state: "", country: "" });
    }
  };

  const handleSave = () => {
    setFormData({ ...formData, location: { currentAddress, permanentAddress } });
    handleBackToSignup();
  };

  return (
    <div className="bg-transparent rounded-lg p-8 max-w-lg w-full ml-4">
      <h2 className="text-xl font-bold text-white mb-4">Location Details</h2>

      <div className="mb-4">
        <h3 className="text-lg text-white mb-2">Current Address</h3>

        <select
          name="country"
          value={currentAddress.country}
          onChange={(e) => handleAddressChange(e, "current")}
          className="w-full p-3 mb-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Select Country</option>
          {Object.keys(countriesAndStates).map((country, index) => (
            <option key={index} value={country}>{country}</option>
          ))}
        </select>

        <select
          name="state"
          value={currentAddress.state}
          onChange={(e) => handleAddressChange(e, "current")}
          className="w-full p-3 mb-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          disabled={!currentAddress.country}
        >
          <option value="">Select State</option>
          {currentAddress.country && Object.keys(countriesAndStates[currentAddress.country]).map((state, index) => (
            <option key={index} value={state}>{state}</option>
          ))}
        </select>

        <select
          name="city"
          value={currentAddress.city}
          onChange={(e) => handleAddressChange(e, "current")}
          className="w-full p-3 mb-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          disabled={!currentAddress.state}
        >
          <option value="">Select City</option>
          {currentAddress.state && countriesAndStates[currentAddress.country][currentAddress.state].map((city, index) => (
            <option key={index} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="text-white">
          <input type="checkbox" checked={sameAsCurrent} onChange={handleCheckboxChange} /> Same as Current Address
        </label>
      </div>

      {!sameAsCurrent && (
        <div className="mb-4">
          <h3 className="text-lg text-white mb-2">Permanent Address</h3>

          <select
            name="country"
            value={permanentAddress.country}
            onChange={(e) => handleAddressChange(e, "permanent")}
            className="w-full p-3 mb-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Select Country</option>
            {Object.keys(countriesAndStates).map((country, index) => (
              <option key={index} value={country}>{country}</option>
            ))}
          </select>

          <select
            name="state"
            value={permanentAddress.state}
            onChange={(e) => handleAddressChange(e, "permanent")}
            className="w-full p-3 mb-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            disabled={!permanentAddress.country}
          >
            <option value="">Select State</option>
            {permanentAddress.country && Object.keys(countriesAndStates[permanentAddress.country]).map((state, index) => (
              <option key={index} value={state}>{state}</option>
            ))}
          </select>

          <select
            name="city"
            value={permanentAddress.city}
            onChange={(e) => handleAddressChange(e, "permanent")}
            className="w-full p-3 mb-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            disabled={!permanentAddress.state}
          >
            <option value="">Select City</option>
            {permanentAddress.state && countriesAndStates[permanentAddress.country][permanentAddress.state].map((city, index) => (
              <option key={index} value={city}>{city}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full bg-white text-orange-500 font-semibold p-3 rounded-lg hover:bg-gray-100 transition duration-300"
      >
        Save & Next
      </button>
    </div>
  );
};

export default LocationForm;
