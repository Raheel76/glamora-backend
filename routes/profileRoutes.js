const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const profileController = require('../controllers/profileControllers');
const upload = require('../middleware/upload');
const { validateProfile } = require('../middleware/validateProfile')
const { validationResult } = require('express-validator');


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/', protect, profileController.getProfile);
router.put(
  '/',
  protect,
  upload.single('profileImage'),
  validateProfile,
  validate,
  profileController.updateProfile
);
router.delete('/', protect, profileController.deleteProfile);

module.exports = router;