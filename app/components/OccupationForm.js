import React, { useState } from "react";

const OccupationForm = ({ formData, setFormData, handleBackToSignup }) => {
  const [occupationDetails, setOccupationDetails] = useState({
    placeOfOccupation: "",
    incomeRange: "",
    highestEducation: "",
    educationInstitution: "",
    degree: "",
    otherDegree: "", // For the "Other" option
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "degree" && value === "Other") {
      setOccupationDetails({ ...occupationDetails, [name]: value, otherDegree: "" });
    } else {
      setOccupationDetails({ ...occupationDetails, [name]: value });
    }
  };

  const handleSave = () => {
    setFormData({ ...formData, occupation: occupationDetails });
    handleBackToSignup();
  };

  return (
    <div className="bg-transparent rounded-lg p-8 max-w-lg w-full ml-4">
      <h2 className="text-xl font-bold text-white mb-4">Occupation & Education Details</h2>
      {[
        { label: "Place of Occupation", name: "placeOfOccupation" },
        {
          label: "Income Range",
          name: "incomeRange",
          type: "select",
          options: [
            "15k to 30k",
            "30k to 80k",
            "80k to 2L",
            "Above 2L",
          ],
        },
        {
          label: "Highest Education",
          name: "highestEducation",
          type: "select",
          options: [
            "High School",
            "Bachelor's",
            "Master's",
            "PhD",
            "Other",
          ],
        },
        { label: "Education Institution", name: "educationInstitution" },
        {
          label: "Degree",
          name: "degree",
          type: "select",
          options: [
            "B.Tech",
            "M.Tech",
            "MBA",
            "B.Sc",
            "M.Sc",
            "Other",
          ],
        },
      ].map((field, index) => (
        <div key={index} className="mb-4">
          <label className="block text-white mb-2" htmlFor={field.name}>
            {field.label}
          </label>
          {field.type === "select" ? (
            <select
              id={field.name}
              name={field.name}
              value={occupationDetails[field.name]}
              onChange={handleChange}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Select {field.label}</option>
              {field.options.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id={field.name}
              name={field.name}
              value={occupationDetails[field.name]}
              onChange={handleChange}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder={field.label}
            />
          )}
        </div>
      ))}
      {occupationDetails.degree === "Other" && (
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="otherDegree">
            Please specify your degree
          </label>
          <input
            type="text"
            id="otherDegree"
            name="otherDegree"
            value={occupationDetails.otherDegree}
            onChange={(e) => setOccupationDetails({ ...occupationDetails, otherDegree: e.target.value })}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Type your degree"
          />
        </div>
      )}
      <button
        onClick={handleSave}
        className="w-full bg-white text-orange-500 font-semibold p-3 rounded-lg hover:bg-gray-100 transition duration-300"
      >
        Save & Back
      </button>
    </div>
  );
};

export default OccupationForm;
