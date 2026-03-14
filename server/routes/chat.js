const express = require('express');
const supabase = require('../db/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Send a message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { matchId, content, type = 'text', duration = null } = req.body;

    // Verify the match exists and user is part of it
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.user1_id !== req.user.id && match.user2_id !== req.user.id) {
      return res.status(403).json({ message: 'You are not part of this match' });
    }

    // Get sender's name
    const { data: sender } = await supabase
      .from('users')
      .select('name')
      .eq('id', req.user.id)
      .single();

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: req.user.id,
        content,
        message_type: type,
        duration
      })
      .select()
      .single();

    if (error) throw error;

    const formattedMessage = {
      ...message,
      id: message.id,
      matchId: message.match_id,
      senderId: message.sender_id,
      senderName: sender ? sender.name : 'Unknown',
      messageType: message.message_type,
      duration: message.duration,
      readAt: message.read_at,
      createdAt: message.created_at
    };

    // Emit via socket
    const io = req.app.get('io');
    io.to(`chat-${matchId}`).emit('new-message', formattedMessage);

    // Send notification to the other user
    const receiverId = match.user1_id === req.user.id ? match.user2_id : match.user1_id;
    io.to(`user-${receiverId}`).emit('new-message-notification', {
      matchId,
      senderName: sender?.name || 'Someone',
      preview: content.substring(0, 50)
    });

    res.status(201).json(formattedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a match
router.get('/:matchId', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Verify the match exists and user is part of it
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.user1_id !== req.user.id && match.user2_id !== req.user.id) {
      return res.status(403).json({ message: 'You are not part of this match' });
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get sender names
    const senderIds = [...new Set(messages.map(m => m.sender_id))];
    const { data: senders } = await supabase
      .from('users')
      .select('id, name')
      .in('id', senderIds);

    const senderMap = {};
    if (senders) {
      senders.forEach(s => senderMap[s.id] = s.name);
    }

    // Format messages
    const formattedMessages = messages.map(m => ({
      ...m,
      id: m.id,
      matchId: m.match_id,
      senderId: m.sender_id,
      senderName: senderMap[m.sender_id] || 'Unknown',
      messageType: m.message_type || 'text',
      duration: m.duration,
      readAt: m.read_at,
      createdAt: m.created_at
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.post('/:matchId/read', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Verify the match exists and user is part of it
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.user1_id !== req.user.id && match.user2_id !== req.user.id) {
      return res.status(403).json({ message: 'You are not part of this match' });
    }

    // Mark all unread messages from the other user as read
    const { data, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('match_id', matchId)
      .neq('sender_id', req.user.id)
      .is('read_at', null)
      .select();

    if (error) throw error;

    // Notify the sender that their messages were read
    const io = req.app.get('io');
    const senderId = match.user1_id === req.user.id ? match.user2_id : match.user1_id;
    io.to(`user-${senderId}`).emit('messages-read', {
      matchId,
      readAt: new Date().toISOString(),
      readBy: req.user.id
    });

    res.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
