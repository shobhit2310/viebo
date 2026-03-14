const express = require('express');
const supabase = require('../db/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ============================================
// DATE PLANNING ROUTES
// ============================================

// Create a date proposal
router.post('/propose', authMiddleware, async (req, res) => {
  try {
    const { matchId, title, date, time, location, activity, notes } = req.body;

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

    const receiverId = match.user1_id === req.user.id ? match.user2_id : match.user1_id;

    // Create date proposal
    const { data: dateProposal, error } = await supabase
      .from('date_proposals')
      .insert({
        match_id: matchId,
        proposer_id: req.user.id,
        receiver_id: receiverId,
        title,
        date,
        time,
        location,
        activity,
        notes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Get proposer name
    const { data: proposer } = await supabase
      .from('users')
      .select('name')
      .eq('id', req.user.id)
      .single();

    // Notify receiver via socket
    const io = req.app.get('io');
    io.to(`user-${receiverId}`).emit('date-proposal', {
      ...dateProposal,
      proposerName: proposer?.name || 'Someone'
    });

    res.status(201).json(dateProposal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to date proposal (accept/decline/suggest-change)
router.put('/respond/:dateId', authMiddleware, async (req, res) => {
  try {
    const { dateId } = req.params;
    const { status, counterDate, counterTime, counterLocation } = req.body;

    const { data: dateProposal, error: fetchError } = await supabase
      .from('date_proposals')
      .select('*')
      .eq('id', dateId)
      .single();

    if (fetchError || !dateProposal) {
      return res.status(404).json({ message: 'Date proposal not found' });
    }

    if (dateProposal.receiver_id !== req.user.id) {
      return res.status(403).json({ message: 'You cannot respond to this proposal' });
    }

    let updateData = { status };
    
    if (status === 'counter') {
      updateData = {
        status: 'counter',
        counter_date: counterDate || dateProposal.date,
        counter_time: counterTime || dateProposal.time,
        counter_location: counterLocation || dateProposal.location
      };
    }

    const { data: updated, error } = await supabase
      .from('date_proposals')
      .update(updateData)
      .eq('id', dateId)
      .select()
      .single();

    if (error) throw error;

    // Notify proposer
    const io = req.app.get('io');
    io.to(`user-${dateProposal.proposer_id}`).emit('date-response', {
      dateId,
      status,
      matchId: dateProposal.match_id
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dates for a match
router.get('/match/:matchId', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;

    const { data: dates, error } = await supabase
      .from('date_proposals')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(dates || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all upcoming dates for user
router.get('/upcoming', authMiddleware, async (req, res) => {
  try {
    const { data: dates, error } = await supabase
      .from('date_proposals')
      .select('*')
      .or(`proposer_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
      .eq('status', 'accepted')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    // Enrich with match and user details
    const enrichedDates = await Promise.all((dates || []).map(async (date) => {
      const otherUserId = date.proposer_id === req.user.id ? date.receiver_id : date.proposer_id;
      
      const { data: otherUser } = await supabase
        .from('users')
        .select('id, name, avatar')
        .eq('id', otherUserId)
        .single();

      return {
        ...date,
        otherUser
      };
    }));

    res.json(enrichedDates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// ICEBREAKER QUESTIONS ROUTES
// ============================================

const icebreakerQuestions = [
  { id: 1, category: 'fun', question: "If you could have dinner with anyone, dead or alive, who would it be?" },
  { id: 2, category: 'fun', question: "What's the most spontaneous thing you've ever done?" },
  { id: 3, category: 'fun', question: "If you won the lottery tomorrow, what's the first thing you'd do?" },
  { id: 4, category: 'deep', question: "What's something you've always wanted to try but haven't yet?" },
  { id: 5, category: 'deep', question: "What's a belief you held strongly but changed your mind about?" },
  { id: 6, category: 'deep', question: "What's the best advice you've ever received?" },
  { id: 7, category: 'flirty', question: "What's your idea of a perfect date?" },
  { id: 8, category: 'flirty', question: "What's the most romantic thing someone has done for you?" },
  { id: 9, category: 'flirty', question: "What do you find most attractive in a person?" },
  { id: 10, category: 'fun', question: "What's your go-to karaoke song?" },
  { id: 11, category: 'fun', question: "If you could live in any movie universe, which would it be?" },
  { id: 12, category: 'deep', question: "What's a small thing that brings you immense joy?" },
  { id: 13, category: 'deep', question: "What's your love language?" },
  { id: 14, category: 'flirty', question: "Do you believe in love at first sight?" },
  { id: 15, category: 'flirty', question: "What's the cheesiest pickup line that would actually work on you?" },
  { id: 16, category: 'fun', question: "What's a weird food combination you secretly love?" },
  { id: 17, category: 'fun', question: "If you could swap lives with anyone for a day, who would it be?" },
  { id: 18, category: 'deep', question: "What's something on your bucket list?" },
  { id: 19, category: 'deep', question: "What's a life lesson you learned the hard way?" },
  { id: 20, category: 'flirty', question: "What would you do if we were stuck in an elevator together?" },
  { id: 21, category: 'fun', question: "What's the most embarrassing song on your playlist?" },
  { id: 22, category: 'fun', question: "If you were a superhero, what would your power be?" },
  { id: 23, category: 'deep', question: "What scares you, but you want to do it anyway?" },
  { id: 24, category: 'flirty', question: "What's the first thing you noticed about me?" },
  { id: 25, category: 'fun', question: "What's your guilty pleasure TV show?" }
];

// Get random icebreaker questions
router.get('/icebreakers', authMiddleware, (req, res) => {
  const { category } = req.query;
  
  let questions = icebreakerQuestions;
  if (category && category !== 'all') {
    questions = questions.filter(q => q.category === category);
  }
  
  // Shuffle and return 5 questions
  const shuffled = questions.sort(() => Math.random() - 0.5);
  res.json(shuffled.slice(0, 5));
});

// Get all icebreaker questions
router.get('/icebreakers/all', authMiddleware, (req, res) => {
  res.json(icebreakerQuestions);
});

// ============================================
// DATE ACTIVITY SUGGESTIONS
// ============================================

const activitySuggestions = {
  'Music': [
    { title: 'Concert Night', description: 'Catch a live show together', icon: '🎵' },
    { title: 'Karaoke Date', description: 'Sing your hearts out', icon: '🎤' },
    { title: 'Record Store Visit', description: 'Browse vinyl together', icon: '💿' }
  ],
  'Food': [
    { title: 'Cooking Class', description: 'Learn a new cuisine together', icon: '👨‍🍳' },
    { title: 'Food Tour', description: 'Explore local restaurants', icon: '🍽️' },
    { title: 'Picnic Date', description: 'Pack snacks and find a park', icon: '🧺' }
  ],
  'Sports': [
    { title: 'Game Night', description: 'Watch a game together', icon: '🏟️' },
    { title: 'Active Date', description: 'Go for a hike or bike ride', icon: '🚴' },
    { title: 'Mini Golf', description: 'Friendly competition', icon: '⛳' }
  ],
  'Art': [
    { title: 'Museum Visit', description: 'Explore art together', icon: '🖼️' },
    { title: 'Paint & Sip', description: 'Create art with wine', icon: '🎨' },
    { title: 'Gallery Walk', description: 'Discover local artists', icon: '🏛️' }
  ],
  'Movies': [
    { title: 'Movie Marathon', description: 'Pick a series to binge', icon: '🎬' },
    { title: 'Drive-In Theater', description: 'Old school movie date', icon: '🚗' },
    { title: 'Film Festival', description: 'Catch indie films', icon: '🎞️' }
  ],
  'Travel': [
    { title: 'Day Trip', description: 'Explore a nearby town', icon: '🚗' },
    { title: 'Staycation', description: 'Tourist in your own city', icon: '🏨' },
    { title: 'Scenic Drive', description: 'Find a beautiful route', icon: '🛣️' }
  ],
  'Gaming': [
    { title: 'Arcade Date', description: 'Old school gaming fun', icon: '🕹️' },
    { title: 'Board Game Cafe', description: 'Strategy and snacks', icon: '🎲' },
    { title: 'Escape Room', description: 'Solve puzzles together', icon: '🔐' }
  ],
  'Fitness': [
    { title: 'Yoga Session', description: 'Stretch and relax together', icon: '🧘' },
    { title: 'Rock Climbing', description: 'Challenge yourselves', icon: '🧗' },
    { title: 'Dance Class', description: 'Learn salsa or swing', icon: '💃' }
  ],
  'default': [
    { title: 'Coffee Date', description: 'Classic and cozy', icon: '☕' },
    { title: 'Sunset Watch', description: 'Find a great viewpoint', icon: '🌅' },
    { title: 'Farmers Market', description: 'Browse local goods', icon: '🥕' }
  ]
};

// Get activity suggestions based on shared interests
router.get('/suggestions/:matchId', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Get both users' interests
    const { data: users } = await supabase
      .from('users')
      .select('id, interests')
      .in('id', [match.user1_id, match.user2_id]);

    // Find shared interests
    const user1Interests = users?.find(u => u.id === match.user1_id)?.interests || [];
    const user2Interests = users?.find(u => u.id === match.user2_id)?.interests || [];
    const sharedInterests = user1Interests.filter(i => user2Interests.includes(i));

    // Get suggestions based on shared interests
    let suggestions = [];
    
    if (sharedInterests.length > 0) {
      sharedInterests.forEach(interest => {
        if (activitySuggestions[interest]) {
          suggestions.push(...activitySuggestions[interest].map(s => ({
            ...s,
            basedOn: interest
          })));
        }
      });
    }
    
    // Always add default suggestions
    suggestions.push(...activitySuggestions.default.map(s => ({
      ...s,
      basedOn: 'general'
    })));

    // Shuffle and limit
    const shuffled = suggestions.sort(() => Math.random() - 0.5);
    
    res.json({
      sharedInterests,
      suggestions: shuffled.slice(0, 6)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
