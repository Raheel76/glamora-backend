const User = require('../models/user');
const { validationResult } = require('express-validator');
const path = require('path');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            'firstName lastName mobileNumber email address profileImage'
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            success: true,
            profile: user,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { firstName, lastName, mobileNumber, address } = req.body;
        const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

        // Fetch existing user to check for profileImage
        const existingUser = await User.findById(req.user._id);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If no new image is uploaded and no existing image, require an image
        if (!profileImage && !existingUser.profileImage) {
            return res.status(400).json({ message: 'Profile image is required' });
        }

        const updateData = {
            firstName,
            lastName,
            mobileNumber,
            address,
            ...(profileImage && { profileImage }), // Only update profileImage if a new one is provided
        };

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('firstName lastName mobileNumber email address profileImage');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: user,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    firstName: '',
                    lastName: '',
                    mobileNumber: '',
                    address: '',
                    profileImage: '',
                },
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile deleted successfully',
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};