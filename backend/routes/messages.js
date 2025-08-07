import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// Get messages between two users
router.get('/:userId', async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    }).sort({ createdAt: 1 })
      .populate('sender', 'username profilePicture')
      .populate('recipient', 'username profilePicture');

    // Mark messages as read
    await Message.updateMany(
      {
        sender: otherUserId,
        recipient: currentUserId,
        status: { $ne: 'read' }
      },
      {
        status: 'read',
        readAt: new Date()
      }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/', async (req, res) => {
  try {
    const { recipientId, content, type = 'text', mediaUrl = '' } = req.body;
    const senderId = req.user.id;

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
      type,
      mediaUrl
    });

    await message.save();
    
    // Populate sender info
    await message.populate('sender', 'username profilePicture');
    await message.populate('recipient', 'username profilePicture');

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update message status
router.put('/:messageId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const messageId = req.params.messageId;

    const update = { status };
    if (status === 'delivered') {
      update.deliveredAt = new Date();
    } else if (status === 'read') {
      update.readAt = new Date();
    }

    const message = await Message.findByIdAndUpdate(
      messageId,
      update,
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete message
router.delete('/:messageId', async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get last message for each conversation
router.get('/conversations/last', async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            _id: 1,
            username: 1,
            profilePicture: 1,
            isOnline: 1,
            lastSeen: 1
          },
          lastMessage: 1
        }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
