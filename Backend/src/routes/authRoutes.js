const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

router.post('/invite', protect, restrictTo('Admin'), authController.generateInvite);
router.post('/invite/bulk', protect, restrictTo('Admin'), authController.generateBulkInvites);
router.get('/invitations', protect, restrictTo('Admin'), authController.getInvitations);

router.post('/google', authController.googleAuth);

module.exports = router;
