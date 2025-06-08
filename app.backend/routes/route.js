const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const authMiddleware = require('../middleware/authMiddleware'); // dacă e în alt folder, ajustează calea

// GET /routes – toate rutele utilizatorului autentificat
router.get('/', authMiddleware, async (req, res) => {
  try {
    const routes = await Route.find({ userId: req.user.userId }).populate('cityId');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la preluarea rutelor' });
  }
});

// GET /routes/:id – o rută după ID (doar dacă aparține user-ului)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const route = await Route.findOne({ _id: req.params.id, userId: req.user.userId }).populate('cityId');
    if (!route) return res.status(404).json({ message: 'Ruta nu a fost găsită' });

    res.json(route);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la preluare rută' });
  }
});

// POST /routes – creare rută nouă
router.post('/', authMiddleware, async (req, res) => {
  const { name, cityId, googlePlaceIds } = req.body;

  if (!name || !cityId) {
    return res.status(400).json({ message: 'Numele și orașul sunt obligatorii' });
  }

  try {
    const newRoute = new Route({
      userId: req.user.userId,
      name,
      cityId,
      googlePlaceIds: googlePlaceIds || []
    });

    const savedRoute = await newRoute.save();
    res.status(201).json(savedRoute);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la salvarea rutei' });
  }
});

// PUT /routes/:id – actualizare rută
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, cityId, googlePlaceIds } = req.body;

  try {
    const route = await Route.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, cityId, googlePlaceIds },
      { new: true }
    );

    if (!route) return res.status(404).json({ message: 'Ruta nu a fost găsită sau nu ai acces' });

    res.json(route);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la actualizare' });
  }
});

// DELETE /routes/:id – ștergere rută
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Route.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

    if (!result) return res.status(404).json({ message: 'Ruta nu a fost găsită sau nu ai acces' });

    res.json({ message: 'Ruta a fost ștearsă' });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la ștergere' });
  }
});

module.exports = router;
