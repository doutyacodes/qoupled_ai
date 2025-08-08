"use client";
import React, { useState, useEffect } from "react";
import { 
  User, 
  Heart, 
  Check, 
  CheckCheck, 
  Filter, 
  Cigarette, 
  Wine, 
  Utensils, 
  Dumbbell, 
  Baby, 
  PawPrint, 
  Sparkles,
  Save,
  AlertCircle
} from 'lucide-react';
import GlobalApi from "@/app/_services/GlobalApi";
import { useRouter } from "next/navigation";

const PreferencesPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [optionsByCategory, setOptionsByCategory] = useState({});
  const [userPreferences, setUserPreferences] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await GlobalApi.GetUserPreferences(token);
      
      // Process the data
      const { categories, optionsByCategory, userPreferences } = response.data;
      
      setCategories(categories);
      setOptionsByCategory(optionsByCategory);
      
      // Convert user preferences to a more usable format
      const prefsMap = {};
      userPreferences.forEach(pref => {
        prefsMap[pref.categoryId] = pref.optionId;
      });
      
      setUserPreferences(prefsMap);
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (categoryId, optionId) => {
    setUserPreferences(prev => ({
      ...prev,
      [categoryId]: optionId
    }));
    setIsChanged(true);
  };

  const savePreferences = async () => {
    setSaving(true);
    setSaveMessage(null);
    
    try {
      const token = localStorage.getItem("token");
      
      // Save each changed preference
      for (const [categoryId, optionId] of Object.entries(userPreferences)) {
        await GlobalApi.SaveUserPreference({ categoryId, optionId }, token);
      }
      
      setSaveMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setIsChanged(false);
      
      // Redirect after successful save (optional)
      // setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      console.error("Error saving preferences:", error);
      setSaveMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
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
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Your Preferences</h2>
          <p className="mt-3 text-lg text-white/80 max-w-2xl mx-auto">
            Tell us about yourself to help us find your perfect match.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-rose-500 to-red-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Personal Details</h3>
          </div>
          
          <div className="p-6">
            {/* Success/Error Message */}
            {saveMessage && (
              <div className={`mb-6 p-4 rounded-lg ${
                saveMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {saveMessage.type === 'success' 
                    ? <CheckCheck className="h-5 w-5 mr-2" /> 
                    : <AlertCircle className="h-5 w-5 mr-2" />}
                  <p>{saveMessage.text}</p>
                </div>
              </div>
            )}
            
            <div className="grid gap-8 md:grid-cols-2">
              {categories.map(category => (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(category.name)}
                    <label className="block text-lg font-medium text-gray-700">
                      {category.display_name}
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {optionsByCategory[category.id]?.map(option => (
                      <div 
                        key={option.id}
                        onClick={() => handlePreferenceChange(category.id, option.id)}
                        className={`
                          cursor-pointer rounded-lg border p-3 transition-all
                          ${userPreferences[category.id] === option.id 
                            ? 'border-rose-500 bg-rose-50 text-rose-700' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {option.display_value}
                          </span>
                          {userPreferences[category.id] === option.id && (
                            <Check className="h-4 w-4 text-rose-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10">
              <button
                onClick={savePreferences}
                disabled={!isChanged || saving}
                className={`
                  w-full bg-gradient-to-r from-rose-500 to-red-600 text-white 
                  font-medium py-3 px-4 rounded-xl flex items-center justify-center
                  transition-all duration-200
                  ${(!isChanged || saving) 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:shadow-md'}
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
                    <span>Save Preferences</span>
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

export default PreferencesPage;