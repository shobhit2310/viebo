const express = require('express');
const supabase = require('../db/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const JOIN_RADIUS_METERS = 800;

// Generate a random 6-character event code
const generateEventCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

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

const toFiniteNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const calculateDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const earthRadius = 6371000;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

// Create event
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      startTime,
      endTime,
      location,
      locationLat,
      locationLng,
      placeId,
      eventType,
      category,
      tags,
      coverImage,
      maxAttendees,
      isPublic,
      vibe
    } = req.body;

    const parsedLat = toFiniteNumber(locationLat);
    const parsedLng = toFiniteNumber(locationLng);

    // Enforce map selection ONLY for private events
    if (!isPublic && (!location || parsedLat === null || parsedLng === null)) {
      return res.status(400).json({ message: 'Please select an exact location from the map for private events' });
    }
    
    // Generate unique event code
    let eventCode;
    let codeExists = true;
    while (codeExists) {
      eventCode = generateEventCode();
      const { data } = await supabase
        .from('events')
        .select('id')
        .eq('code', eventCode)
        .single();
      codeExists = !!data;
    }

    // Combine date and time for start/end
    const eventDate = new Date(date);
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(eventDate);
    startDateTime.setHours(startHour, startMin, 0);
    
    const endDateTime = new Date(eventDate);
    endDateTime.setHours(endHour, endMin, 0);
    
    // If end time is before start time, event ends next day
    if (endHour < startHour || (endHour === startHour && endMin < startMin)) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    // Create event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        code: eventCode,
        name,
        description: description || '',
        date: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location,
        location_latitude: parsedLat,
        location_longitude: parsedLng,
        location_place_id: placeId || null,
        creator_id: req.user.id,
        is_active: true,
        category: category || 'social',
        tags: tags || [],
        cover_image: coverImage || null,
        max_attendees: maxAttendees || null,
        is_public: isPublic || false,
        vibe: vibe || 'casual'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    // Add creator as participant
    const { error: participantError } = await supabase
      .from('event_participants')
      .insert({
        event_id: event.id,
        user_id: req.user.id
      });

    if (participantError) {
      console.error('Supabase participant insert error:', participantError);
      throw participantError;
    }

    res.status(201).json({
      ...event,
      startTime,
      endTime,
      eventType: eventType || event.category || 'party',
      status: 'upcoming',
      attendees: [req.user.id],
      category: event.category,
      tags: event.tags,
      coverImage: event.cover_image,
      maxAttendees: event.max_attendees,
      isPublic: event.is_public,
      vibe: event.vibe
    });
  } catch (error) {
    console.error('Event creation route error:', error);
    // Return detailed error message if it's a Supabase/Database error
    const errorMessage = error.message || 'Server error';
    res.status(500).json({ 
      message: errorMessage,
      details: error.details || null,
      hint: error.hint || null
    });
  }
});

// Join event with code
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { code, userLatitude, userLongitude } = req.body;
    
    // Find event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (eventError || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Enforce distance check only for private events
    if (!event.is_public && event.location_latitude !== null && event.location_longitude !== null) {
      const parsedUserLat = toFiniteNumber(userLatitude);
      const parsedUserLng = toFiniteNumber(userLongitude);

      if (parsedUserLat === null || parsedUserLng === null) {
        return res.status(400).json({
          message: 'Location access is required to join this event. You must be within 800 meters of the event location.'
        });
      }

      const distanceMeters = calculateDistanceMeters(
        parsedUserLat,
        parsedUserLng,
        event.location_latitude,
        event.location_longitude
      );

      if (distanceMeters > JOIN_RADIUS_METERS) {
        return res.status(403).json({
          message: 'You are too far from the event location. Move within 800 meters to join.',
          requiredRadiusMeters: JOIN_RADIUS_METERS,
          distanceMeters: Math.round(distanceMeters)
        });
      }
    }

    // Check if event is closed
    const status = getEventStatus(event);
    if (status === 'closed') {
      return res.status(400).json({ message: 'This event has ended' });
    }

    // Check if already attending
    const { data: existingParticipant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', req.user.id)
      .single();

    if (existingParticipant) {
      return res.status(400).json({ message: 'You are already attending this event' });
    }

    // Check max attendees
    const { data: currentParticipants } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', event.id);

    const currentCount = currentParticipants?.length || 0;

    if (event.max_attendees && currentCount >= event.max_attendees) {
      return res.status(400).json({ 
        message: 'Event is full', 
        isFull: true,
        maxAttendees: event.max_attendees,
        currentCount
      });
    }

    // Add user as participant
    await supabase
      .from('event_participants')
      .insert({
        event_id: event.id,
        user_id: req.user.id
      });

    // Get updated attendee list
    const { data: participants } = await supabase
      .from('event_participants')
      .select('user_id')
      .eq('event_id', event.id);

    res.json({
      ...event,
      status,
      attendees: participants.map(p => p.user_id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my events (created and joined)
router.get('/my-events', authMiddleware, async (req, res) => {
  try {
    // Get events user is participating in
    const { data: participants } = await supabase
      .from('event_participants')
      .select('event_id')
      .eq('user_id', req.user.id);

    if (!participants || participants.length === 0) {
      return res.json([]);
    }

    const eventIds = participants.map(p => p.event_id);

    // Get event details
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);

    if (error) throw error;

    // Get attendees for each event and add status
    const enrichedEvents = await Promise.all(events.map(async (event) => {
      const { data: eventParticipants } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', event.id);

      return {
        ...event,
        status: getEventStatus(event),
        attendees: eventParticipants ? eventParticipants.map(p => p.user_id) : [],
        creatorId: event.creator_id
      };
    }));

    res.json(enrichedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Get event
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is attending
    const { data: participant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', req.user.id)
      .single();

    if (!participant) {
      return res.status(403).json({ message: 'You are not attending this event' });
    }

    // Get all participants
    const { data: participants } = await supabase
      .from('event_participants')
      .select('user_id')
      .eq('event_id', event.id);

    const attendeeIds = participants.map(p => p.user_id);

    // Get attendee details
    const { data: attendees } = await supabase
      .from('users')
      .select('id, name, age, gender, bio, interests, avatar')
      .in('id', attendeeIds);

    res.json({
      ...event,
      status: getEventStatus(event),
      attendees: attendeeIds,
      attendeeDetails: attendees,
      creatorId: event.creator_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave event
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    // Get event
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Can't leave if you're the creator
    if (event.creator_id === req.user.id) {
      return res.status(400).json({ message: 'Creator cannot leave the event' });
    }

    // Remove user from participants
    await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', event.id)
      .eq('user_id', req.user.id);

    res.json({ message: 'Left event successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
