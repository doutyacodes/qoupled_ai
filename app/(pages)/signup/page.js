"use client";
import Slide1 from "@/app/components/Slide1";
import Slide2 from "@/app/components/Slide2";
import { useRouter } from "next/navigation"; // Correct import for navigation in the App Router
import { useState } from "react";
import LocationForm from "../../components/LocationForm";
import OccupationForm from "../../components/OccupationForm";

const Signup = () => {
  const router = useRouter(); // Initialize useRouter from next/navigation
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    gender: "",
    location: "",
    occupation: "",
    religion: "",
    languages: "",
    accountFor: "",
  });

  const [currentCard, setCurrentCard] = useState("slide1");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    router.push("/explore"); // Navigate to the Explore page
  };

  const handleCardSwitch = (card) => setCurrentCard(card);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-500 to-orange-500 p-4">
      {/* Render Slide1 Component */}
      {currentCard === "slide1" && (
        <Slide1
          nextSlide={() => handleCardSwitch("slide2")}
          setFormData={setFormData}
        />
      )}

      {/* Render Slide2 Component */}
      {currentCard === "slide2" && (
        <Slide2
          nextSlide={() => handleCardSwitch("signup")}
          setFormData={setFormData}
        />
      )}

      {/* Render Signup Form */}
      {currentCard === "signup" && (
        <div className="bg-transparent rounded-lg p-8 max-w-lg w-full">
          <div className="flex justify-center mb-8">
            <img src="/transparent_logo.png" alt="Logo" className="h-17 w-16" />
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Sign Up</h2>
          </div>
          <form onSubmit={handleSubmit}>
            {[
              { label: "Name", type: "text", name: "name" },
              { label: "Date of Birth", type: "date", name: "birthDate" },
              {
                label: "Gender",
                type: "select",
                name: "gender",
                options: ["Male", "Female", "Other"],
              },
              {
                label: "Location",
                type: "button",
                name: "location",
                buttonHandler: () => handleCardSwitch("location"),
              },
              {
                label: "Occupation",
                type: "button",
                name: "occupation",
                buttonHandler: () => handleCardSwitch("occupation"),
              },
              {
                label: "Religion",
                type: "select",
                name: "religion",
                options: [
                  "Christianity",
                  "Islam",
                  "Hinduism",
                  "Buddhism",
                  "Sikhism",
                  "Others",
                ],
              },
              {
                label: "Languages",
                type: "select",
                name: "languages",
                options: [
                  "English",
                  "Marathi",
                  "Hindi",
                  "Tamil",
                  "Spanish",
                  "French",
                ],
              },
            ].map((field, index) => (
              <div className="mb-4" key={index}>
                <label className="block text-white mb-2" htmlFor={field.name}>
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "button" ? (
                  <button
                    type="button"
                    onClick={field.buttonHandler}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {field.label}
                  </button>
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                )}
              </div>
            ))}
            <div className="mb-6" />
            <button
              type="submit"
              className="w-full bg-white text-orange-500 font-semibold p-3 rounded-lg hover:bg-gray-100 transition duration-300"
            >
              Sign Up
            </button>
          </form>
        </div>
      )}

      {currentCard === "location" && (
        <LocationForm
          formData={formData}
          setFormData={setFormData}
          handleBackToSignup={() => handleCardSwitch("signup")}
        />
      )}

      {currentCard === "occupation" && (
        <OccupationForm
          formData={formData}
          setFormData={setFormData}
          handleBackToSignup={() => handleCardSwitch("signup")}
        />
      )}
    </div>
  );
};

export default Signup;
