const express = require('express');
const authRoutes = require('./authRoutes');
const departmentRoutes = require('./departmentRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);

module.exports = router;

