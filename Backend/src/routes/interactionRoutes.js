const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

router.post('/users/:studentId/follow', protect, restrictTo('Recruiter'), interactionController.followStudent);
router.get('/users/:studentId/follow-status', protect, restrictTo('Recruiter'), interactionController.getFollowStatus);

module.exports = router;
