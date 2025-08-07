import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get all users (except current user)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user.id } 
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { status, profilePicture } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        status,
        profilePicture,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
