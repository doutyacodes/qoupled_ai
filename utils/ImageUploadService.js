// import axios from 'axios';

// class ImageUploadService {
//   static CPANEL_UPLOAD_URL = 'https://wowfy.in/quopled/upload.php';
//   static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
//   static ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
//   static UPLOAD_TIMEOUT = 60000; // 60 seconds in milliseconds

//   /**
//    * Validate image file before upload
//    * @param {File} file - The image file to validate
//    * @returns {Object} - { isValid: boolean, error: string }
//    */
//   static validateImage(file) {
//     if (!file) {
//       return { isValid: false, error: 'No file selected' };
//     }

//     if (file.size > this.MAX_FILE_SIZE) {
//       return { isValid: false, error: 'Image size must be less than 5MB' };
//     }

//     if (!this.ALLOWED_TYPES.includes(file.type)) {
//       return { isValid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
//     }

//     return { isValid: true, error: null };
//   }

//   /**
//    * Upload single image to cPanel server
//    * @param {File} file - The image file to upload
//    * @param {string} type - Upload type (default: 'photo')
//    * @returns {Promise<string>} - Returns the uploaded image URL/filename
//    */
//   static async uploadSingleImage(file, type = 'photo') {

//     console.log("file", file)
//     // Validate file first
//     const validation = this.validateImage(file);
//     if (!validation.isValid) {
//       throw new Error(validation.error);
//     }

//     const formData = new FormData();
//     formData.append('coverImage', file);
//     formData.append('type', type);

//     try {
//       const response = await axios.post(
//         this.CPANEL_UPLOAD_URL,
//         formData,
//         {
//           headers: { 
//             'Content-Type': 'multipart/form-data'
//           },
//           timeout: this.UPLOAD_TIMEOUT,
//           onUploadProgress: (progressEvent) => {
//             if (progressEvent.total) {
//               const percentCompleted = Math.round(
//                 (progressEvent.loaded * 100) / progressEvent.total
//               );
//               console.log(`Upload progress: ${percentCompleted}%`);
//             }
//           }
//         }
//       );

//       // Check for successful response
//       if (response.data && response.data.imageUrl) {
//         return response.data.imageUrl;
//       } else if (response.data && response.data.fileName) {
//         return response.data.fileName;
//       } else if (typeof response.data === 'string' && response.data.trim()) {
//         return response.data.trim();
//       }

//       throw new Error('Invalid response from upload server');
//     } catch (error) {
//       console.error('Image upload error:', error);
      
//       if (error.code === 'ECONNABORTED') {
//         throw new Error('Upload timeout - please try again');
//       } else if (error.response) {
//         const errorMsg = error.response.data?.message || error.response.data?.error || 'Upload failed';
//         throw new Error(errorMsg);
//       } else if (error.request) {
//         throw new Error('Network error - please check your connection');
//       }
      
//       throw new Error(error.message || 'Failed to upload image');
//     }
//   }

//   /**
//    * Upload multiple images with individual error handling
//    * @param {File[]} files - Array of image files
//    * @param {string} type - Upload type
//    * @returns {Promise<Object[]>} - Array of { success: boolean, url: string, error: string, index: number }
//    */
//   static async uploadMultipleImagesWithStatus(files, type = 'photo') {
//     if (!files || files.length === 0) {
//       return [];
//     }

//     console.log(`Starting upload of ${files.length} images...`);

//     const uploadPromises = files.map(async (file, index) => {
//       try {
//         console.log(`Uploading image ${index + 1}/${files.length}...`);
//         const url = await this.uploadSingleImage(file, type);
//         console.log(`Image ${index + 1} uploaded successfully:`, url);
//         return { success: true, url, error: null, index };
//       } catch (error) {
//         console.error(`Image ${index + 1} upload failed:`, error.message);
//         return { success: false, url: null, error: error.message, index };
//       }
//     });

//     const results = await Promise.all(uploadPromises);
    
//     const successCount = results.filter(r => r.success).length;
//     console.log(`Upload complete: ${successCount}/${files.length} successful`);
    
//     return results;
//   }

//   /**
//    * Create preview URL for local file
//    * @param {File} file - Image file
//    * @returns {Promise<string>} - Data URL for preview
//    */
//   static createPreviewUrl(file) {
//     return new Promise((resolve, reject) => {
//       if (!file) {
//         reject(new Error('No file provided'));
//         return;
//       }

//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.onerror = () => reject(new Error('Failed to read file'));
//       reader.readAsDataURL(file);
//     });
//   }
// }

// export default ImageUploadService;

import axios from 'axios';

class ImageUploadService {
  static CPANEL_UPLOAD_URL = 'https://wowfy.in/quopled/upload.php';
  static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  static ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Validate image file
   */
  static validateImage(file) {
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { isValid: false, error: 'Image size must be less than 5MB' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
    }

    return { isValid: true, error: null };
  }

  /**
   * Upload single image - SIMPLIFIED
   */
    static async uploadSingleImage(file, type = 'photo') {
    const validation = this.validateImage(file);
    if (!validation.isValid) {
        throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('coverImage', file);
    formData.append('type', type);

    try {
        const response = await axios.post(this.CPANEL_UPLOAD_URL, formData);

        console.log('Server response:', response.data);

        // Check for success and get the file path
        if (response.data?.success && response.data?.filePath) {
        // Build full URL based on file type
        // const baseUrl = 'https://wowfy.in/quopled';
        // const folder = type === 'photo' ? 'images' : type === 'video' ? 'videos' : 'audio';
        const fullUrl = `${response.data.filePath}`;
        return fullUrl;
        }

        // Handle error response
        if (response.data?.error) {
        throw new Error(response.data.error);
        }

        throw new Error('No file path received from server');
    } catch (error) {
        console.error('Upload error:', error);
        if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
        }
        if (error.message) throw new Error(error.message);
        throw new Error('Upload failed');
    }
    }

  /**
   * Upload multiple images - SIMPLIFIED
   */
  static async uploadMultipleImagesWithStatus(files, type = 'photo') {
    if (!files || files.length === 0) return [];

    const results = [];
    
    // Upload one by one (sequential, not parallel)
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await this.uploadSingleImage(files[i], type);
        results.push({ success: true, url, error: null, index: i });
      } catch (error) {
        results.push({ success: false, url: null, error: error.message, index: i });
      }
    }
    
    return results;
  }

  /**
   * Create preview URL
   */
  static createPreviewUrl(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

export default ImageUploadService;