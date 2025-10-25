"use client"
import React, { useState } from 'react';
import { Heart, Upload, Trash2, AlertCircle } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ProfileImagesManager({ images, onUpdate, editMode, BASE_IMAGE_URL }) {
  const [uploadedImages, setUploadedImages] = useState(images || []);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding these files would exceed the limit
    if (uploadedImages.length + files.length > 3) {
      toast.error('You can only upload a maximum of 3 images');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} is not a valid image format`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Upload images one by one
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('coverImage', file);
        formData.append('type', 'photo');
        
        const response = await axios.post(
          'https://wowfy.in/quopled/upload.php',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        if (response.data.success) {
          return {
            image_url: response.data.filePath,
            is_profile: uploadedImages.length === 0 && validFiles.indexOf(file) === 0 // First image is profile
          };
        }
        throw new Error(response.data.error);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...uploadedImages, ...uploadedUrls];
      
      setUploadedImages(newImages);
      onUpdate(newImages);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    
    // If we removed the profile image, make the first remaining image the profile
    if (updatedImages.length > 0 && !updatedImages.some(img => img.is_profile)) {
      updatedImages[0].is_profile = true;
    }
    
    setUploadedImages(updatedImages);
    onUpdate(updatedImages);
    toast.success('Image removed');
  };

  const handleSetProfileImage = (index) => {
    const updatedImages = uploadedImages.map((img, i) => ({
      ...img,
      is_profile: i === index
    }));
    
    setUploadedImages(updatedImages);
    onUpdate(updatedImages);
    toast.success('Profile image updated');
  };

  // Get the profile image for the header
  const profileImage = uploadedImages.find(img => img.is_profile) || uploadedImages[0];

  if (!editMode) {
    // View mode - show profile image in header
    return (
      <div className="h-32 w-32 rounded-xl border-4 border-white shadow-md overflow-hidden bg-white">
        {profileImage ? (
          <img 
            src={`${BASE_IMAGE_URL}${profileImage.image_url}`} 
            alt="Profile" 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <Heart size={40} className="text-gray-400" />
          </div>
        )}
      </div>
    );
  }

  // Edit mode - show all images with management options
  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Profile Photos
        <span className="text-red-500 ml-1">*</span>
        <span className="text-xs font-normal text-gray-500 ml-2">
          (Minimum 1, Maximum 3)
        </span>
      </label>

      {/* Image Grid Display */}
      <div className="grid grid-cols-3 gap-4">
        {uploadedImages.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-2xl overflow-hidden border-4 border-gray-200 relative">
              <img
                src={`${BASE_IMAGE_URL}${image.image_url}`}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Profile Badge */}
              {image.is_profile && (
                <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-current" />
                  Profile
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!image.is_profile && (
                  <button
                    type="button"
                    onClick={() => handleSetProfileImage(index)}
                    className="p-2 bg-white rounded-full hover:bg-rose-50 transition-colors"
                    title="Set as profile photo"
                  >
                    <Heart className="h-4 w-4 text-rose-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Upload Button */}
        {uploadedImages.length < 3 && (
          <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-rose-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-rose-50 group">
            <Upload className="h-8 w-8 text-gray-400 group-hover:text-rose-500 transition-colors" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-rose-600">
              {isUploading ? 'Uploading...' : 'Add Photo'}
            </span>
            <span className="text-xs text-gray-400">
              {uploadedImages.length}/3
            </span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">Photo Tips:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Upload 1-3 clear photos of yourself</li>
              <li>• Click the heart icon to set as profile photo</li>
              <li>• Max size: 5MB per photo (JPG, PNG, WebP)</li>
            </ul>
          </div>
        </div>
      </div>

      {uploadedImages.length === 0 && (
        <p className="text-red-500 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          Please upload at least one profile photo
        </p>
      )}
    </div>
  );
}