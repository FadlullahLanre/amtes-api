const express = require('express');
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const User = require("../models/user");

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  confirmEmail,
  resendEmail,
  protect,
  logout,
  updateMe
} = require('../controllers/user');


router.route('/auth/login').post(login);
router.route('/auth/signup').post(signup);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resendEmail').post(resendEmail);
router.route('/resetPassword/:token').post(resetPassword);
router.route('/confirmEmail/:token').get(confirmEmail);
router.route('/logout').get(protect, logout);


router.put("/update-user/", protect, upload.single("image",), async (req, res, next) => {
  try {

    const user_id = req.user.id
    const { phone_number, location, bio, twitter, facebook, linkedin, occupation } = req.body

    // Upload image to cloudinary
    await cloudinary.uploader.upload(req.file.path, {folder: 'Amtes'}, (err, result) => {
      if (err) {
        return res.status(400).json({ message: 'Error uploading image' })
      }
      const profile_img = result.secure_url
      const cloudinary_id = result.public_id

      // update user profile
      User.findByIdAndUpdate(user_id, {
        bio: bio,
        profile_img: profile_img,
        cloudinary_id: cloudinary_id,
        twitter: twitter,
        facebook: facebook,
        linkedin: linkedin,
        occupation: occupation,
        location: location,
        phone_number: phone_number

      }, { new: true }, (err, user) => {
        if (err) {
          return res.status(400).json({ message: 'Error updating user' });
        }
        res.status(200).json(user);

      });
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
