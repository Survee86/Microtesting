import Profile from '../models/profile.js';

export const getProfile = async (req, res) => {
  try {
    console.log('Fetching profile for user ID:', req.user.userId);
    
    const profile = await Profile.findOne({ userId: Number(req.user.userId) })
      .lean()
      .exec();
    
    if (!profile) {
      console.log('Profile not found, returning empty object');
      return res.json({});
    }
    
    res.json(profile);
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      })
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: Number(req.user.userId) },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};