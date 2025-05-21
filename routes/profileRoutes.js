const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const profileController = require('../controllers/profileControllers');
const upload = require('../middleware/upload');
const validate = require('../middleware/validation');

router.get('/', protect, profileController.getProfile);
router.put(
  '/',
  protect,
  upload.single('profileImage'),
  validate.validateProfile,
  profileController.updateProfile
);
router.delete('/', protect, profileController.deleteProfile);

module.exports = router;