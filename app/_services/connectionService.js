// app/_services/connectionService.js
const BASE_URL = '/api';

/**
 * Helper function to get the auth headers
 * @returns {Object} Headers object with Authorization token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Fetch all users with accepted connections to the current user
 * @returns {Promise<{users: Array}>} - Promise that resolves to connected users data
 */
export const fetchConnectedUsers = async () => {
  try {
    const res = await fetch(`${BASE_URL}/connections/accepted`, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch connections');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching connected users:', error);
    return { users: [] }; // Return empty array on error to avoid breaking UI
  }
};

/**
 * Get connection status with a specific user
 * @param {string|number} userId - The ID of the user to check connection with
 * @returns {Promise<Object>} - Promise that resolves to the connection status
 */
export const getConnectionStatus = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const res = await fetch(`${BASE_URL}/connections/status/${userId}`, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get connection status');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching connection status:', error);
    return { status: 'error' }; // Return status error on failure
  }
};

/**
 * Send a connection request to a user
 * @param {string|number} receiverId - The ID of the user to send connection request to
 * @returns {Promise<Object>} - Promise that resolves to the request result
 */
export const sendConnectionRequest = async (receiverId) => {
  try {
    if (!receiverId) throw new Error('Receiver ID is required');
    
    const res = await fetch(`${BASE_URL}/connections/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiverId }),
    });
    
    // Handle conflict (409) status for existing connections gracefully
    if (res.status === 409) {
      return res.json(); // Return existing connection info
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to send connection request');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error sending connection request:', error);
    return { success: false, message: error.message || 'Failed to send request' };
  }
};

/**
 * Respond to a connection request
 * @param {string|number} connectionId - The ID of the connection request
 * @param {string} response - The response ('accepted', 'rejected', or 'blocked')
 * @returns {Promise<Object>} - Promise that resolves to the response result
 */
export const respondToConnectionRequest = async (connectionId, response) => {
  try {
    if (!connectionId) throw new Error('Connection ID is required');
    if (!response || !['accepted', 'rejected', 'blocked'].includes(response)) {
      throw new Error('Valid response is required (accepted, rejected, or blocked)');
    }
    
    const res = await fetch(`${BASE_URL}/connections/respond`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ connectionId, response }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to respond to connection request');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error responding to connection request:', error);
    return { success: false, message: error.message || 'Failed to respond to request' };
  }
};

/**
 * Get all pending connection requests for the current user
 * @returns {Promise<{requests: Array}>} - Promise that resolves to pending requests
 */
export const getPendingRequests = async () => {
  try {
    const res = await fetch(`${BASE_URL}/connections/pending`, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch pending requests');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return { requests: [] }; // Return empty array on error to avoid breaking UI
  }
};