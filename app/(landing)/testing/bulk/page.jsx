'use client';

import { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';

import ImageUploadService from "@/utils/ImageUploadService";


export default function AdminUserCreator() {
  const [users, setUsers] = useState([{ 
    id: 1, 
    name: '', 
    gender: 'Male', 
    lookingFor: 'Female',
    image: null,
    imagePreview: null,
    country: null,
    state: null,
    city: null,
    religion: null,
    caste: null
  }]);
  
  const [religions, setReligions] = useState([]);
  const [castes, setCastes] = useState({});
  const [countries, setCountries] = useState([]);
  
  // Location settings
  const [locationMode, setLocationMode] = useState('individual');
  const [commonLocation, setCommonLocation] = useState({
    country: null,
    state: null,
    city: null
  });
  
  // Religion settings
  const [religionMode, setReligionMode] = useState('individual');
  const [commonReligion, setCommonReligion] = useState({
    religion: null,
    caste: null
  });
  
  const [progress, setProgress] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    fetchReligions();
    const countryList = Country.getAllCountries().map(c => ({
      value: c.isoCode,
      label: c.name,
      code: c.isoCode
    }));
    setCountries(countryList);
  }, []);

  const fetchReligions = async () => {
    try {
      const response = await fetch('/api/religions');
      const data = await response.json();
      
      if (data.success) {
        const religionList = data.data.map(religion => ({
          value: religion.id,
          label: religion.name,
          name: religion.name,
          id: religion.id
        }));
        religionList.push({ value: 'Other', label: 'Other', name: 'Other', id: 'Other' });
        setReligions(religionList);
        console.log('Religions loaded:', religionList);
      }
    } catch (error) {
      console.error('Error fetching religions:', error);
      setReligions([{ value: 'Other', label: 'Other', name: 'Other', id: 'Other' }]);
    }
  };

  const fetchCastes = async (religionName, index = null) => {
    console.log('fetchCastes called with:', { religionName, index });
    try {
      const url = `/api/castes?religion=${encodeURIComponent(religionName)}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Caste API response:', data);
      
      if (data.success) {
        const casteList = data.data.map(caste => ({
          value: caste.id,
          label: caste.name
        }));
        casteList.push({ value: 'Other', label: 'Other' });
        
        console.log('Castes processed:', casteList);
        
        if (index !== null) {
          console.log('Setting castes for index:', index);
          setCastes(prev => {
            const updated = { ...prev, [index]: casteList };
            console.log('Updated castes state:', updated);
            return updated;
          });
        } else {
          console.log('Setting common castes');
          setCastes(prev => {
            const updated = { ...prev, common: casteList };
            console.log('Updated castes state:', updated);
            return updated;
          });
        }
      } else {
        console.log('API returned success:false');
      }
    } catch (error) {
      console.error('Error fetching castes:', error);
      const fallback = [{ value: 'Other', label: 'Other' }];
      if (index !== null) {
        setCastes(prev => ({ ...prev, [index]: fallback }));
      } else {
        setCastes(prev => ({ ...prev, common: fallback }));
      }
    }
  };

  const addUser = () => {
    setUsers([...users, { 
      id: users.length + 1, 
      name: '', 
      gender: 'Male', 
      lookingFor: 'Female',
      image: null,
      imagePreview: null,
      country: null,
      state: null,
      city: null,
      religion: null,
      caste: null
    }]);
  };

  const removeUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const updateUser = (id, field, value) => {
    setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const handleImageUpload = (id, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUsers(users.map(u => 
          u.id === id ? { ...u, image: file, imagePreview: reader.result } : u
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationChange = (index, field, value) => {
    const user = users[index];
    let updates = { [field]: value };
    
    if (field === 'country') {
      updates.state = null;
      updates.city = null;
    } else if (field === 'state') {
      updates.city = null;
    }
    
    setUsers(users.map((u, i) => i === index ? { ...u, ...updates } : u));
  };

  const handleReligionChange = (index, religionValue) => {
    console.log('handleReligionChange called with:', { index, religionValue });
    console.log('Current religions:', religions);
    
    const religion = religions.find(r => r.value == religionValue); // Use == instead of === to handle string/number comparison
    console.log('Found religion:', religion);
    
    setUsers(users.map((u, i) => 
      i === index ? { ...u, religion: religionValue, caste: null } : u
    ));
    
    // Always fetch castes when religion is selected (not "Other")
    if (religion && religion.name && religion.name !== 'Other') {
      console.log('Calling fetchCastes with religion.name:', religion.name, 'index:', index);
      fetchCastes(religion.name, index);
    } else {
      console.log('Not fetching castes - religion is Other or invalid');
      // Clear castes if "Other" or no valid religion
      setCastes(prev => ({ ...prev, [index]: [] }));
    }
  };

  const handleCommonReligionChange = (religionValue) => {
    console.log('handleCommonReligionChange called with:', religionValue);
    
    const religion = religions.find(r => r.value == religionValue); // Use == instead of === to handle string/number comparison
    console.log('Found common religion:', religion);
    
    setCommonReligion({ religion: religionValue, caste: null });
    
    if (religion && religion.name && religion.name !== 'Other') {
      console.log('Calling fetchCastes for common religion:', religion.name);
      fetchCastes(religion.name, null);
    } else {
      console.log('Not fetching castes - common religion is Other or invalid');
      setCastes(prev => ({ ...prev, common: [] }));
    }
  };

  const getStates = (countryCode) => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode).map(s => ({
      value: s.isoCode,
      label: s.name,
      code: s.isoCode
    }));
  };

  const getCities = (countryCode, stateCode) => {
    if (!countryCode || !stateCode) return [];
    return City.getCitiesOfState(countryCode, stateCode).map(c => ({
      value: c.name,
      label: c.name
    }));
  };

  const createUsers = async () => {
    setIsCreating(true);
    setError(null);
    setProgress([]);
    setSuccessCount(0);
    
    let created = 0;
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      try {
        setProgress(prev => [...prev, { 
          id: user.id, 
          status: 'uploading_image', 
          name: user.name 
        }]);
        
        let imageUrl = null;
        if (user.image) {
          imageUrl = await ImageUploadService.uploadSingleImage(user.image, 'photo');
        }
        
        setProgress(prev => prev.map(p => 
          p.id === user.id ? { ...p, status: 'creating_user' } : p
        ));
        
        const location = locationMode === 'same' ? commonLocation : {
          country: user.country,
          state: user.state,
          city: user.city
        };
        
        const religionData = religionMode === 'same' ? commonReligion : {
          religion: user.religion,
          caste: user.caste
        };
        
        const userData = {
          name: user.name,
          gender: user.gender,
          lookingFor: user.lookingFor,
          imageUrl: imageUrl,
          country: countries.find(c => c.value === location.country)?.label,
          countryCode: location.country,
          state: location.state ? getStates(location.country).find(s => s.value === location.state)?.label : null,
          stateCode: location.state,
          city: location.city,
          religionId: religionData.religion,
          casteId: religionData.caste
        };
        
        const response = await fetch('/api/testing/bulk-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          setProgress(prev => prev.map(p => 
            p.id === user.id ? { ...p, status: 'success', userId: result.userId } : p
          ));
          created++;
          setSuccessCount(created);
        } else {
          setProgress(prev => prev.map(p => 
            p.id === user.id ? { ...p, status: 'error', error: result.message } : p
          ));
        }
        
      } catch (err) {
        console.error('Error creating user:', err);
        setProgress(prev => prev.map(p => 
          p.id === user.id ? { ...p, status: 'error', error: err.message } : p
        ));
      }
    }
    
    setIsCreating(false);
  };

  const canCreate = users.every(u => u.name.trim() && u.image);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Admin User Creator
          </h1>
          <p className="text-gray-600 text-sm">
            Create test users with complete profiles
          </p>
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Settings</h2>
          
          {/* Location Settings */}
          <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2 text-sm">Location Settings</h3>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="individual"
                  checked={locationMode === 'individual'}
                  onChange={(e) => setLocationMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Individual</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="same"
                  checked={locationMode === 'same'}
                  onChange={(e) => setLocationMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Same for all</span>
              </label>
            </div>
            
            {locationMode === 'same' && (
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={commonLocation.country || ''}
                  onChange={(e) => setCommonLocation({ country: e.target.value, state: null, city: null })}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                
                <select
                  value={commonLocation.state || ''}
                  onChange={(e) => setCommonLocation({ ...commonLocation, state: e.target.value, city: null })}
                  disabled={!commonLocation.country}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white disabled:bg-gray-100"
                >
                  <option value="">Select State</option>
                  {getStates(commonLocation.country).map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                
                <select
                  value={commonLocation.city || ''}
                  onChange={(e) => setCommonLocation({ ...commonLocation, city: e.target.value })}
                  disabled={!commonLocation.state}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white disabled:bg-gray-100"
                >
                  <option value="">Select City</option>
                  {getCities(commonLocation.country, commonLocation.state).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Religion Settings */}
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2 text-sm">Religion & Caste Settings</h3>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="individual"
                  checked={religionMode === 'individual'}
                  onChange={(e) => setReligionMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Individual</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="same"
                  checked={religionMode === 'same'}
                  onChange={(e) => setReligionMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Same for all</span>
              </label>
            </div>
            
            {religionMode === 'same' && (
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={commonReligion.religion || ''}
                  onChange={(e) => handleCommonReligionChange(e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                >
                  <option value="">Select Religion</option>
                  {religions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                
                <select
                  value={commonReligion.caste || ''}
                  onChange={(e) => setCommonReligion({ ...commonReligion, caste: e.target.value })}
                  disabled={!commonReligion.religion}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white disabled:bg-gray-100"
                >
                  <option value="">Select Caste</option>
                  {(castes.common || []).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="space-y-3 mb-6">
          {users.map((user, index) => (
            <div key={user.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3 flex-wrap">
                {/* User Number */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">#{user.id}</span>
                  {users.length > 1 && (
                    <button
                      onClick={() => removeUser(user.id)}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Name */}
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => updateUser(user.id, 'name', e.target.value)}
                  placeholder="Name *"
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white w-40"
                />

                {/* Gender */}
                <select
                  value={user.gender}
                  onChange={(e) => updateUser(user.id, 'gender', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white w-24"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                {/* Looking For */}
                <select
                  value={user.lookingFor}
                  onChange={(e) => updateUser(user.id, 'lookingFor', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white w-24"
                >
                  <option value="Male">M</option>
                  <option value="Female">F</option>
                  <option value="Both">Both</option>
                  <option value="Other">Other</option>
                </select>

                {/* Image Upload */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(user.id, e.target.files[0])}
                    className="text-xs text-gray-900 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 w-48"
                  />
                  {user.imagePreview && (
                    <img 
                      src={user.imagePreview} 
                      alt="Preview" 
                      className="w-8 h-8 object-cover rounded border border-gray-300"
                    />
                  )}
                </div>

                {/* Individual Location */}
                {locationMode === 'individual' && (
                  <>
                    <select
                      value={user.country || ''}
                      onChange={(e) => handleLocationChange(index, 'country', e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white w-32"
                    >
                      <option value="">Country</option>
                      {countries.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    
                    <select
                      value={user.state || ''}
                      onChange={(e) => handleLocationChange(index, 'state', e.target.value)}
                      disabled={!user.country}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white disabled:bg-gray-100 w-32"
                    >
                      <option value="">State</option>
                      {getStates(user.country).map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    
                    <select
                      value={user.city || ''}
                      onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                      disabled={!user.state}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white disabled:bg-gray-100 w-32"
                    >
                      <option value="">City</option>
                      {getCities(user.country, user.state).map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </>
                )}

                {/* Individual Religion */}
                {religionMode === 'individual' && (
                  <>
                    <select
                      value={user.religion || ''}
                      onChange={(e) => handleReligionChange(index, e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white w-32"
                    >
                      <option value="">Religion</option>
                      {religions.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    
                    <select
                      value={user.caste || ''}
                      onChange={(e) => updateUser(user.id, 'caste', e.target.value)}
                      disabled={!user.religion}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white disabled:bg-gray-100 w-32"
                    >
                      <option value="">Caste</option>
                      {(castes[index] || []).map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={addUser}
            disabled={isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
          >
            Add User
          </button>
          
          <button
            onClick={createUsers}
            disabled={!canCreate || isCreating}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
          >
            {isCreating ? 'Creating...' : `Create ${users.length} User${users.length > 1 ? 's' : ''}`}
          </button>
        </div>

        {/* Progress */}
        {progress.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Progress: {successCount}/{users.length}
            </h3>
            <div className="space-y-2">
              {progress.map(p => (
                <div
                  key={p.id}
                  className={`p-3 rounded text-sm border ${
                    p.status === 'success' ? 'bg-green-50 border-green-300' :
                    p.status === 'error' ? 'bg-red-50 border-red-300' :
                    'bg-blue-50 border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{p.name}</span>
                    <span className="text-xs text-gray-700">
                      {p.status === 'uploading_image' && 'Uploading image...'}
                      {p.status === 'creating_user' && 'Creating user...'}
                      {p.status === 'success' && 'Success'}
                      {p.status === 'error' && 'Failed'}
                    </span>
                  </div>
                  {p.error && (
                    <div className="mt-1 text-xs text-red-700">{p.error}</div>
                  )}
                  {p.userId && (
                    <div className="mt-1 text-xs text-gray-600">User ID: {p.userId}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}