const express = require('express');
const router = express.Router();
const { Department } = require('../models');

// Get all active departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'code', 'description'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

