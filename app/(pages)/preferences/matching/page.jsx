"use client";
import React, { useState, useEffect } from "react";
import {
  Heart,
  Filter,
  Sliders,
  ChevronRight,
  Check,
  CheckCheck,
  Cigarette,
  Wine,
  Utensils,
  Dumbbell,
  Baby,
  PawPrint,
  Sparkles,
  Save,
  AlertCircle,
  User,
} from "lucide-react";
import GlobalApi from "@/app/_services/GlobalApi";
import { useRouter } from "next/navigation";

const MatchingPreferencesPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [optionsByCategory, setOptionsByCategory] = useState({});
  const [matchingPreferences, setMatchingPreferences] = useState({});
  const [importanceByCategory, setImportanceByCategory] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    fetchMatchingPreferences();
  }, []);

  const fetchMatchingPreferences = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Fetch all categories and options
      const categoryResponse = await GlobalApi.GetPreferenceCategories(token);
      const { categories, optionsByCategory } = categoryResponse.data;

      // Fetch user's matching preferences
      const matchingResponse = await GlobalApi.GetUserMatchingPreferences(
        token
      );
      const { matchingPreferences } = matchingResponse.data;

      setCategories(categories);
      setOptionsByCategory(optionsByCategory);

      // Convert matching preferences to a more usable format
      const prefsMap = {};
      const importanceMap = {};

      matchingPreferences.forEach((pref) => {
        prefsMap[pref.categoryId] = pref.optionIds || [];
        importanceMap[pref.categoryId] = pref.importance || "nice_to_have";
      });

      setMatchingPreferences(prefsMap);
      setImportanceByCategory(importanceMap);
    } catch (error) {
      console.error("Error fetching matching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionToggle = (categoryId, optionId) => {
    setMatchingPreferences((prev) => {
      const currentOptions = prev[categoryId] || [];
      const newOptions = currentOptions.includes(optionId)
        ? currentOptions.filter((id) => id !== optionId)
        : [...currentOptions, optionId];

      return {
        ...prev,
        [categoryId]: newOptions,
      };
    });

    setIsChanged(true);
  };

  const handleImportanceChange = (categoryId, importance) => {
    setImportanceByCategory((prev) => ({
      ...prev,
      [categoryId]: importance,
    }));

    setIsChanged(true);
  };

  const saveMatchingPreferences = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const token = localStorage.getItem("token");

      // Save each category's matching preferences
      for (const categoryId of Object.keys(matchingPreferences)) {
        const optionIds = matchingPreferences[categoryId] || [];
        const importance = importanceByCategory[categoryId] || "nice_to_have";

        await GlobalApi.SaveUserMatchingPreference(
          {
            categoryId,
            optionIds,
            importance,
          },
          token
        );
      }

      setSaveMessage({
        type: "success",
        text: "Matching preferences saved successfully!",
      });
      setIsChanged(false);

      // Redirect after successful save (optional)
      // setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      console.error("Error saving matching preferences:", error);
      setSaveMessage({
        type: "error",
        text: "Failed to save preferences. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Get icon for a category
  const getCategoryIcon = (categoryName) => {
    const icons = {
      gender: <User className="h-5 w-5" />,
      looking_for: <Heart className="h-5 w-5" />,
      smoking: <Cigarette className="h-5 w-5" />,
      drinking: <Wine className="h-5 w-5" />,
      diet: <Utensils className="h-5 w-5" />,
      exercise: <Dumbbell className="h-5 w-5" />,
      children: <Baby className="h-5 w-5" />,
      pets: <PawPrint className="h-5 w-5" />,
      relationship_type: <Sparkles className="h-5 w-5" />,
    };

    return icons[categoryName] || <Filter className="h-5 w-5" />;
  };

  const ImportanceSelector = ({ categoryId }) => {
    const importance = importanceByCategory[categoryId] || "nice_to_have";

    return (
      <div className="mt-3 border-t pt-3">
        <p className="text-sm font-medium text-gray-600 mb-2">
          How important is this?
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {["must_have", "important", "nice_to_have", "not_important"].map(
            (level) => (
              <div
                key={level}
                onClick={() => handleImportanceChange(categoryId, level)}
                className={`
                cursor-pointer rounded-lg border px-3 py-1.5 text-center text-xs transition-all
                ${
                  importance === level
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
              >
                {level
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 pt-5 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 pt-5 pb-16">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Matching Preferences
          </h2>
          <p className="mt-3 text-lg text-white/80 max-w-2xl mx-auto">
            Tell us what you're looking for in a partner to improve your
            matches.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-rose-500 to-red-600 px-6 py-4 flex items-center">
            <Sliders className="h-6 w-6 text-white mr-2" />
            <h3 className="text-xl font-bold text-white">Your Ideal Match</h3>
          </div>

          <div className="p-6">
            {/* Success/Error Message */}
            {saveMessage && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  saveMessage.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-center">
                  {saveMessage.type === "success" ? (
                    <CheckCheck className="h-5 w-5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  )}
                  <p>{saveMessage.text}</p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    {getCategoryIcon(category.name)}
                    <h4 className="text-lg font-medium text-gray-800">
                      {category.display_name}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {optionsByCategory[category.id]?.map((option) => {
                      const isSelected = (
                        matchingPreferences[category.id] || []
                      ).includes(option.id);

                      return (
                        <div
                          key={option.id}
                          onClick={() =>
                            handleOptionToggle(category.id, option.id)
                          }
                          className={`
                            cursor-pointer rounded-lg border p-3 transition-all
                            ${
                              isSelected
                                ? "border-rose-500 bg-rose-50 text-rose-700"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {option.display_value}
                            </span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-rose-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <ImportanceSelector categoryId={category.id} />
                </div>
              ))}
            </div>

            <div className="mt-10">
              <button
                onClick={saveMatchingPreferences}
                disabled={!isChanged || saving}
                className={`
                  w-full bg-gradient-to-r from-rose-500 to-red-600 text-white 
                  font-medium py-3 px-4 rounded-xl flex items-center justify-center
                  transition-all duration-200
                  ${
                    !isChanged || saving
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:shadow-md"
                  }
                `}
              >
                {saving ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    <span>Save Matching Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingPreferencesPage;
