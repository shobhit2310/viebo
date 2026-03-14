const express = require('express');
const supabase = require('../db/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Event categories with icons and colors
const EVENT_CATEGORIES = {
  social: { name: 'Social', icon: 'Users', color: '#ec4899' },
  party: { name: 'Party', icon: 'PartyPopper', color: '#8b5cf6' },
  sports: { name: 'Sports', icon: 'Trophy', color: '#10b981' },
  music: { name: 'Music', icon: 'Music', color: '#f59e0b' },
  food: { name: 'Food & Drinks', icon: 'UtensilsCrossed', color: '#ef4444' },
  outdoor: { name: 'Outdoor', icon: 'Mountain', color: '#22c55e' },
  gaming: { name: 'Gaming', icon: 'Gamepad2', color: '#6366f1' },
  creative: { name: 'Creative', icon: 'Palette', color: '#f472b6' },
  networking: { name: 'Networking', icon: 'Briefcase', color: '#0ea5e9' },
  wellness: { name: 'Wellness', icon: 'Heart', color: '#14b8a6' }
};

// Event vibes
const EVENT_VIBES = {
  casual: { name: 'Casual & Chill', emoji: '😊' },
  energetic: { name: 'High Energy', emoji: '🔥' },
  romantic: { name: 'Romantic', emoji: '💕' },
  adventurous: { name: 'Adventurous', emoji: '🎯' },
  sophisticated: { name: 'Sophisticated', emoji: '✨' },
  fun: { name: 'Fun & Games', emoji: '🎮' }
};

// Get event categories
router.get('/categories', (req, res) => {
  res.json(EVENT_CATEGORIES);
});

// Get event vibes
router.get('/vibes', (req, res) => {
  res.json(EVENT_VIBES);
});

// Discover public events
router.get('/discover', authMiddleware, async (req, res) => {
  try {
    const { category, vibe, search, upcoming } = req.query;
    
    let query = supabase
      .from('events')
      .select('*, event_participants(user_id)')
      .eq('is_public', true)
      .eq('is_active', true);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (vibe && vibe !== 'all') {
      query = query.eq('vibe', vibe);
    }

    if (upcoming === 'true') {
      query = query.gte('date', new Date().toISOString());
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: events, error } = await query.order('date', { ascending: true });

    if (error) throw error;

    // Get user's interests for recommendation scoring
    const { data: userData } = await supabase
      .from('users')
      .select('interests')
      .eq('id', req.user.id)
      .single();

    const userInterests = userData?.interests || [];

    // Calculate relevance score and enrich events
    const enrichedEvents = events.map(event => {
      const attendeeCount = event.event_participants?.length || 0;
      let relevanceScore = 0;

      // Score based on matching tags with user interests
      if (event.tags && userInterests.length > 0) {
        const matchingTags = event.tags.filter(tag => 
          userInterests.some(interest => 
            interest.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        );
        relevanceScore += matchingTags.length * 10;
      }

      // Bonus for events with more attendees
      relevanceScore += Math.min(attendeeCount * 2, 20);

      return {
        ...event,
        attendeeCount,
        relevanceScore,
        isFull: event.max_attendees ? attendeeCount >= event.max_attendees : false,
        spotsLeft: event.max_attendees ? event.max_attendees - attendeeCount : null
      };
    });

    // Sort by relevance if not filtered
    if (!category && !vibe && !search) {
      enrichedEvents.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    res.json(enrichedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recommended events for user
router.get('/recommended', authMiddleware, async (req, res) => {
  try {
    // Get user's interests
    const { data: userData } = await supabase
      .from('users')
      .select('interests')
      .eq('id', req.user.id)
      .single();

    const userInterests = userData?.interests || [];

    // Get upcoming public events
    const { data: events, error } = await supabase
      .from('events')
      .select('*, event_participants(user_id)')
      .eq('is_public', true)
      .eq('is_active', true)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(20);

    if (error) throw error;

    // Score and filter events
    const scoredEvents = events.map(event => {
      let score = 0;
      const tags = event.tags || [];
      const description = (event.description || '').toLowerCase();
      const name = event.name.toLowerCase();

      userInterests.forEach(interest => {
        const interestLower = interest.toLowerCase();
        // Check tags
        if (tags.some(tag => tag.toLowerCase().includes(interestLower))) {
          score += 15;
        }
        // Check description
        if (description.includes(interestLower)) {
          score += 10;
        }
        // Check name
        if (name.includes(interestLower)) {
          score += 20;
        }
      });

      // Category bonus
      const categoryInterestMap = {
        music: ['music', 'concerts', 'dancing', 'festivals'],
        sports: ['sports', 'fitness', 'gym', 'running', 'basketball'],
        food: ['food', 'cooking', 'restaurants', 'wine', 'coffee'],
        outdoor: ['hiking', 'camping', 'nature', 'beach', 'travel'],
        gaming: ['gaming', 'video games', 'board games'],
        creative: ['art', 'photography', 'writing', 'crafts'],
        wellness: ['yoga', 'meditation', 'wellness', 'health']
      };

      Object.entries(categoryInterestMap).forEach(([cat, keywords]) => {
        if (event.category === cat) {
          if (userInterests.some(i => keywords.some(k => i.toLowerCase().includes(k)))) {
            score += 25;
          }
        }
      });

      const attendeeCount = event.event_participants?.length || 0;
      
      return {
        ...event,
        attendeeCount,
        recommendationScore: score,
        isFull: event.max_attendees ? attendeeCount >= event.max_attendees : false
      };
    });

    // Filter to only events with score > 0 and sort
    const recommended = scoredEvents
      .filter(e => e.recommendationScore > 0 && !e.isFull)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10);

    res.json(recommended);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== EVENT PHOTOS ====================

// Upload event photo
router.post('/:eventId/photos', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { imageUrl, caption } = req.body;

    // Check if user is attending
    const { data: participant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', req.user.id)
      .single();

    if (!participant) {
      return res.status(403).json({ message: 'You must be attending the event to upload photos' });
    }

    const { data: photo, error } = await supabase
      .from('event_photos')
      .insert({
        event_id: eventId,
        user_id: req.user.id,
        image_url: imageUrl,
        caption
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(photo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event photos
router.get('/:eventId/photos', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    const { data: photos, error } = await supabase
      .from('event_photos')
      .select(`
        *,
        users:user_id(id, name, avatar)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get user's likes
    const { data: userLikes } = await supabase
      .from('event_photo_likes')
      .select('photo_id')
      .eq('user_id', req.user.id);

    const likedPhotoIds = userLikes?.map(l => l.photo_id) || [];

    const enrichedPhotos = photos.map(photo => ({
      ...photo,
      isLiked: likedPhotoIds.includes(photo.id)
    }));

    res.json(enrichedPhotos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike photo
router.post('/:eventId/photos/:photoId/like', authMiddleware, async (req, res) => {
  try {
    const { photoId } = req.params;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('event_photo_likes')
      .select('id')
      .eq('photo_id', photoId)
      .eq('user_id', req.user.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('event_photo_likes')
        .delete()
        .eq('id', existingLike.id);

      // Decrement count
      await supabase.rpc('decrement_photo_likes', { photo_id: photoId });

      res.json({ liked: false });
    } else {
      // Like
      await supabase
        .from('event_photo_likes')
        .insert({
          photo_id: photoId,
          user_id: req.user.id
        });

      // Increment count
      await supabase.rpc('increment_photo_likes', { photo_id: photoId });

      res.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== EVENT GROUP CHAT ====================

// Get event messages
router.get('/:eventId/messages', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is attending
    const { data: participant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', req.user.id)
      .single();

    if (!participant) {
      return res.status(403).json({ message: 'You must be attending the event to view messages' });
    }

    let query = supabase
      .from('event_messages')
      .select(`
        *,
        users:user_id(id, name, avatar)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;

    if (error) throw error;

    // Return in chronological order
    res.json(messages.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send event message
router.post('/:eventId/messages', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { content, messageType = 'text' } = req.body;

    // Verify user is attending
    const { data: participant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', req.user.id)
      .single();

    if (!participant) {
      return res.status(403).json({ message: 'You must be attending the event to send messages' });
    }

    const { data: message, error } = await supabase
      .from('event_messages')
      .insert({
        event_id: eventId,
        user_id: req.user.id,
        content,
        message_type: messageType
      })
      .select(`
        *,
        users:user_id(id, name, avatar)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== WAITLIST ====================

// Join waitlist
router.post('/:eventId/waitlist', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check event exists and has max attendees
    const { data: event } = await supabase
      .from('events')
      .select('*, event_participants(user_id)')
      .eq('id', eventId)
      .single();

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already attending
    const isAttending = event.event_participants?.some(p => p.user_id === req.user.id);
    if (isAttending) {
      return res.status(400).json({ message: 'You are already attending this event' });
    }

    // Check if event is full
    const attendeeCount = event.event_participants?.length || 0;
    if (!event.max_attendees || attendeeCount < event.max_attendees) {
      return res.status(400).json({ message: 'Event is not full, you can join directly' });
    }

    // Check if already on waitlist
    const { data: existingWaitlist } = await supabase
      .from('event_waitlist')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', req.user.id)
      .single();

    if (existingWaitlist) {
      return res.status(400).json({ message: 'You are already on the waitlist' });
    }

    // Get current waitlist count for position
    const { data: waitlistCount } = await supabase
      .from('event_waitlist')
      .select('id')
      .eq('event_id', eventId);

    const position = (waitlistCount?.length || 0) + 1;

    const { data: waitlistEntry, error } = await supabase
      .from('event_waitlist')
      .insert({
        event_id: eventId,
        user_id: req.user.id,
        position
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ position, message: `You are #${position} on the waitlist` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get waitlist for event
router.get('/:eventId/waitlist', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    const { data: waitlist, error } = await supabase
      .from('event_waitlist')
      .select(`
        *,
        users:user_id(id, name, avatar)
      `)
      .eq('event_id', eventId)
      .order('position', { ascending: true });

    if (error) throw error;

    res.json(waitlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave waitlist
router.delete('/:eventId/waitlist', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    await supabase
      .from('event_waitlist')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', req.user.id);

    res.json({ message: 'Left waitlist successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
