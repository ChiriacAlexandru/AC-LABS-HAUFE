const express = require('express');
const axios = require('axios');
const Attraction = require('../models/Attraction');
const City = require('../models/City');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Obține detalii extinse despre un loc de pe Google Maps
async function getPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,types,photos,rating,user_ratings_total,website,url,international_phone_number,opening_hours,address_components&key=${GOOGLE_API_KEY}`;
  const response = await axios.get(url);
  return response.data.result;
}

// Extrage orașul și țara din adresa Google
function extractCityInfo(addressComponents) {
  const city = addressComponents.find(c => c.types.includes('locality') || c.types.includes('administrative_area_level_1'));
  const country = addressComponents.find(c => c.types.includes('country'));

  return {
    name: city?.long_name || null,
    country: country?.long_name || null
  };
}

// Construiește URL complet pentru poze din photo_reference
function buildPhotoUrls(photos) {
  if (!photos || !photos.length) return [];
  return photos.map(photo => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`;
  });
}

// Funcție pentru calculul distanței (formula Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raza Pământului în km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// ===== GET /api/attractions =====
router.get('/', async (req, res) => {
  try {
    const attractions = await Attraction.find()
      .populate('cityId')
      .populate('recommendedBy', 'name email');

    res.json(attractions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la preluarea atracțiilor' });
  }
});

// ===== GET /api/attractions/nearby - ACEASTĂ RUTĂ TREBUIE SĂ FIE ÎNAINTEA /:placeId =====
router.get('/nearby', async (req, res) => {
  const { lat, lng, radius = 50 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude și longitude sunt necesare' });
  }

  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInKm = parseFloat(radius);

    console.log(`Căutare atracții în raza de ${radiusInKm}km de la [${latitude}, ${longitude}]`);

    // Preluăm TOATE atracțiile și calculăm manual distanța
    const allAttractions = await Attraction.find()
      .populate('cityId')
      .populate('recommendedBy', 'name email');

    console.log(`Total atracții în DB: ${allAttractions.length}`);

    // Filtrăm atracțiile din apropiere
    const nearbyAttractions = allAttractions
      .map(attraction => {
        // Verifică dacă atracția are coordonate valide
        if (!attraction.location || 
            typeof attraction.location.lat !== 'number' || 
            typeof attraction.location.lng !== 'number') {
          console.log(`❌ Atracția "${attraction.name}" nu are coordonate valide:`, attraction.location);
          return null;
        }

        const distance = calculateDistance(
          latitude, longitude,
          attraction.location.lat, attraction.location.lng
        );

        console.log(`📏 Distanța la "${attraction.name}": ${distance.toFixed(2)}km`);

        // Adaugă distanța calculată la obiect
        return {
          ...attraction.toObject(),
          calculatedDistance: distance
        };
      })
      .filter(attraction => attraction !== null && attraction.calculatedDistance <= radiusInKm)
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance);

    console.log(`✅ Găsite ${nearbyAttractions.length} atracții în apropiere`);
    res.json(nearbyAttractions);

  } catch (err) {
    console.error('❌ Eroare la căutarea atracțiilor din apropiere:', err);
    res.status(500).json({ message: 'Eroare la căutarea atracțiilor din apropiere' });
  }
});

// ===== POST /api/attractions =====
router.post('/', authMiddleware, async (req, res) => {
  const { googlePlaceId, category, customTags } = req.body;
  const userId = req.user.userId;

  if (!googlePlaceId) return res.status(400).json({ message: 'googlePlaceId este necesar' });

  try {
    // Caută dacă atracția există deja
    let attraction = await Attraction.findOne({ googlePlaceId });

    if (attraction) {
      if (!attraction.recommendedBy.includes(userId)) {
        attraction.recommendedBy.push(userId);
        await attraction.save();
      }
      return res.status(200).json(attraction);
    }

    // Detalii Google Maps
    const placeDetails = await getPlaceDetails(googlePlaceId);
    const { lat, lng } = placeDetails.geometry.location;
    const cityInfo = extractCityInfo(placeDetails.address_components);

    let cityId = null;
    if (cityInfo.name && cityInfo.country) {
      let city = await City.findOne({ name: cityInfo.name, country: cityInfo.country });

      if (!city) {
        city = new City({
          name: cityInfo.name,
          country: cityInfo.country,
          location: { lat, lng }
        });
        await city.save();
      }

      cityId = city._id;
    }

    // Construim link-urile complete pentru poze
    const photos = buildPhotoUrls(placeDetails.photos);

    attraction = new Attraction({
      googlePlaceId,
      name: placeDetails.name,
      formattedAddress: placeDetails.formatted_address,
      location: { lat, lng },
      types: placeDetails.types,
      photos, // URL-urile complete ale pozelor
      rating: placeDetails.rating,
      userRatingsTotal: placeDetails.user_ratings_total,
      website: placeDetails.website,
      url: placeDetails.url,
      phoneNumber: placeDetails.international_phone_number,
      openingHours: placeDetails.opening_hours?.weekday_text || [],
      cityId,
      category,
      customTags,
      recommendedBy: [userId]
    });

    await attraction.save();
    res.status(201).json(attraction);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la salvarea atracției' });
  }
});

// ===== GET /api/attractions/:placeId - ACEASTĂ RUTĂ TREBUIE SĂ FIE DUPĂ RUTELE SPECIFICE =====
router.get('/:placeId', async (req, res) => {
  const { placeId } = req.params;

  try {
    const attraction = await Attraction.findOne({ googlePlaceId: placeId })
      .populate('cityId')
      .populate('recommendedBy', 'name email');

    if (!attraction) {
      return res.status(404).json({ message: 'Atracția nu a fost găsită' });
    }

    res.json(attraction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la căutarea atracției' });
  }
});

// ===== DELETE /api/attractions/:placeId =====
router.delete('/:placeId', authMiddleware, async (req, res) => {
  const { placeId } = req.params;

  try {
    const attraction = await Attraction.findOneAndDelete({ googlePlaceId: placeId });

    if (!attraction) {
      return res.status(404).json({ message: 'Atracția nu a fost găsită' });
    }

    res.json({ message: 'Atracția a fost ștearsă' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la ștergerea atracției' });
  }
});

module.exports = router;