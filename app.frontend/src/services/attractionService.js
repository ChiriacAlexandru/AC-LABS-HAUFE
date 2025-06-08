const API_BASE_URL = 'http://localhost:3000';

export const attractionService = {
  // Obține toate atracțiile
  getAllAttractions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attractions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Received all attractions:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error in getAllAttractions:', error);
      throw error;
    }
  },

  // Obține atracții din apropiere
  getNearbyAttractions: async (lat, lng, radius = 50) => {
    try {
      const url = `${API_BASE_URL}/api/attractions/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
      console.log('🔍 Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Received nearby attractions:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error in getNearbyAttractions:', error);
      throw error;
    }
  },

  // Obține o atracție după ID
  getAttractionById: async (placeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attractions/${placeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error in getAttractionById:', error);
      throw error;
    }
  },

  // Adaugă o atracție nouă (necesită autentificare)
  addAttraction: async (attractionData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attractions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(attractionData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error in addAttraction:', error);
      throw error;
    }
  },

  // Șterge o atracție (necesită autentificare)
  deleteAttraction: async (placeId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attractions/${placeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error in deleteAttraction:', error);
      throw error;
    }
  }
};