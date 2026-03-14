const express = require('express');
const supabase = require('../db/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Helper to calculate event status
const getEventStatus = (event) => {
  const now = new Date();
  const eventDate = new Date(event.date);
  
  if (event.end_time) {
    const endTime = new Date(event.end_time);
    if (now >= endTime) return 'closed';
    if (now >= eventDate) return 'active';
  }
  
  return 'upcoming';
};

// Send crush (like someone at an event)
router.post('/crush', authMiddleware, async (req, res) => {
  try {
    const { eventId, targetUserId } = req.body;

    // Validate event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is attending
    const { data: userParticipant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', req.user.id)
      .single();

    if (!userParticipant) {
      return res.status(403).json({ message: 'You are not attending this event' });
    }

    // Check if target user is attending
    const { data: targetParticipant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', targetUserId)
      .single();

    if (!targetParticipant) {
      return res.status(400).json({ message: 'Target user is not attending this event' });
    }

    // Can't crush yourself
    if (req.user.id === targetUserId) {
      return res.status(400).json({ message: 'Cannot crush yourself' });
    }

    // Check if already crushed
    const { data: existingCrush } = await supabase
      .from('crushes')
      .select('id')
      .eq('event_id', eventId)
      .eq('from_user_id', req.user.id)
      .eq('to_user_id', targetUserId)
      .single();

    if (existingCrush) {
      return res.status(400).json({ message: 'You already have a crush on this person for this event' });
    }

    // Create crush
    const { error: crushError } = await supabase
      .from('crushes')
      .insert({
        event_id: eventId,
        from_user_id: req.user.id,
        to_user_id: targetUserId
      });

    if (crushError) throw crushError;

    // Check for mutual crush
    const { data: mutualCrush } = await supabase
      .from('crushes')
      .select('id')
      .eq('event_id', eventId)
      .eq('from_user_id', targetUserId)
      .eq('to_user_id', req.user.id)
      .single();

    if (mutualCrush) {
      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('id')
        .eq('event_id', eventId)
        .or(`and(user1_id.eq.${req.user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${req.user.id})`)
        .single();

      if (!existingMatch) {
        // Create a match!
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            event_id: eventId,
            user1_id: req.user.id,
            user2_id: targetUserId
          })
          .select()
          .single();

        if (matchError) throw matchError;

        // Get target user details for notification
        const { data: targetUser } = await supabase
          .from('users')
          .select('name')
          .eq('id', targetUserId)
          .single();

        // Get current user details
        const { data: currentUser } = await supabase
          .from('users')
          .select('name')
          .eq('id', req.user.id)
          .single();

        // Notify both users via socket
        const io = req.app.get('io');
        
        // Original match event (for event page celebration)
        io.emit('new-match', {
          matchId: match.id,
          eventId,
          users: [req.user.id, targetUserId]
        });

        // Notification event (for toast notifications)
        io.to(`user-${targetUserId}`).emit('new-match-notification', {
          matchId: match.id,
          eventId,
          users: [req.user.id, targetUserId],
          matchedUserName: currentUser?.name || 'Someone'
        });

        return res.json({ 
          message: "It's a match! You both have a crush on each other!", 
          isMatch: true,
          matchId: match.id,
          match 
        });
      }
    }

    res.json({ message: 'Crush sent!', isMatch: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my crushes for an event
router.get('/crushes/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const { data: crushes, error } = await supabase
      .from('crushes')
      .select('to_user_id')
      .eq('event_id', eventId)
      .eq('from_user_id', req.user.id);

    if (error) throw error;

    res.json(crushes ? crushes.map(c => c.to_user_id) : []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my matches
router.get('/my-matches', authMiddleware, async (req, res) => {
  try {
    // Get matches where user is either user1 or user2
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${req.user.id},user2_id.eq.${req.user.id}`);

    if (error) throw error;

    if (!matches || matches.length === 0) {
      return res.json([]);
    }

    // Enrich with user and event details
    const enrichedMatches = await Promise.all(matches.map(async (match) => {
      const otherUserId = match.user1_id === req.user.id ? match.user2_id : match.user1_id;
      
      // Get other user details
      const { data: otherUser } = await supabase
        .from('users')
        .select('id, name, age, gender, bio, interests, avatar')
        .eq('id', otherUserId)
        .single();

      // Get event details
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', match.event_id)
        .single();

      if (otherUser) {
        return {
          ...match,
          id: match.id,
          eventId: match.event_id,
          user1Id: match.user1_id,
          user2Id: match.user2_id,
          otherUser,
          event: event ? { ...event, status: getEventStatus(event) } : null,
          canChat: true
        };
      }
      return null;
    }));

    res.json(enrichedMatches.filter(Boolean));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get matches for a specific event
router.get('/event/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .eq('event_id', eventId)
      .or(`user1_id.eq.${req.user.id},user2_id.eq.${req.user.id}`);

    if (error) throw error;

    if (!matches || matches.length === 0) {
      return res.json([]);
    }

    const enrichedMatches = await Promise.all(matches.map(async (match) => {
      const otherUserId = match.user1_id === req.user.id ? match.user2_id : match.user1_id;
      
      const { data: otherUser } = await supabase
        .from('users')
        .select('id, name, age, gender, bio, interests, avatar')
        .eq('id', otherUserId)
        .single();

      if (otherUser) {
        return {
          ...match,
          id: match.id,
          eventId: match.event_id,
          user1Id: match.user1_id,
          user2Id: match.user2_id,
          otherUser
        };
      }
      return null;
    }));

    res.json(enrichedMatches.filter(Boolean));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
