const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

router.use(protect);

router.get('/', restrictTo('Admin', 'Recruiter'), userController.getAllUsers);
router.patch('/:id', restrictTo('Admin'), userController.updateUser);
router.delete('/:id', restrictTo('Admin'), userController.deleteUser);

module.exports = router;
