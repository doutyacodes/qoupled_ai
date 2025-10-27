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