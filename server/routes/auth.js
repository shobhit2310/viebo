const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const supabase = require('../db/supabase');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email');

const router = express.Router();

// Google OAuth Client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '565517695784-cvrrs1sd8jci61bdqjflah13kicnpj6t.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper to generate random token
const generateToken = () => crypto.randomBytes(32).toString('hex');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, age, gender, bio, interests } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        age: parseInt(age),
        gender,
        bio: bio || '',
        interests: interests || [],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        email_verified: false,
        email_verification_token: verificationToken,
        email_verification_expires: verificationExpires.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue registration even if email fails
    }

    // Return user without password/token fields and require verification first
    const { password: _, email_verification_token: __, ...userWithoutSensitive } = user;
    res.status(201).json({ 
      user: userWithoutSensitive,
      verificationRequired: true,
      message: 'Registration successful! Please check your email to verify your account.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Block login for email/password users until they verify
    if (!user.is_google_user && !user.email_verified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in. Check inbox/spam and tap the verification link.',
        needsVerification: true,
        email: user.email
      });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { credential, mode } = req.body; // mode: 'signin' or 'signup'

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let user;

    if (existingUser) {
      // If trying to signup but user already exists
      if (mode === 'signup') {
        return res.status(400).json({ message: 'User already exists. Please sign in instead.' });
      }
      
      // Update Google info if needed
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          google_id: googleId,
          avatar: picture || existingUser.avatar
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) throw error;
      user = updatedUser;
    } else {
      // If trying to signin but user doesn't exist
      if (mode === 'signin') {
        return res.status(400).json({ message: 'Account not found. Please sign up first.' });
      }
      
      // Create new user from Google data
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          google_id: googleId,
          email,
          name,
          age: null,
          gender: null,
          bio: '',
          interests: [],
          avatar: picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          is_google_user: true,
          email_verified: true,
          needs_profile_completion: false
        })
        .select()
        .single();

      if (error) throw error;
      user = newUser;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    // Return user without password (convert snake_case to camelCase for frontend)
    const { password: _, ...userWithoutPassword } = user;
    const formattedUser = {
      ...userWithoutPassword,
      googleId: user.google_id,
      isGoogleUser: user.is_google_user,
      needsProfileCompletion: user.needs_profile_completion,
      createdAt: user.created_at
    };
    res.json({ token, user: formattedUser });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// Complete profile (for Google users who need to add age/gender)
router.put('/complete-profile', authMiddleware, async (req, res) => {
  try {
    const { age, gender, bio, interests } = req.body;

    if (!age || !gender) {
      return res.status(400).json({ message: 'Age and gender are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({
        age: parseInt(age),
        gender,
        bio: bio || '',
        interests: interests || [],
        needs_profile_completion: false
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, age, gender, bio, interests, avatar } = req.body;

    // Get current user first
    const { data: currentUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine avatar: use provided avatar, keep current, or generate new DiceBear
    let newAvatar = currentUser.avatar;
    if (avatar) {
      // Custom avatar provided (base64 or URL)
      newAvatar = avatar;
    } else if (name && name !== currentUser.name && !currentUser.avatar?.startsWith('data:')) {
      // Name changed and using DiceBear - update avatar seed
      newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({
        name: name || currentUser.name,
        age: age ? parseInt(age) : currentUser.age,
        gender: gender || currentUser.gender,
        bio: bio !== undefined ? bio : currentUser.bio,
        interests: interests || currentUser.interests,
        avatar: newAvatar
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email_verification_token', token)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    // Check if token expired
    if (new Date(user.email_verification_expires) < new Date()) {
      return res.status(400).json({ message: 'Verification link has expired. Please request a new one.' });
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Auto-login after successful verification
    const tokenPayload = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    const { password: _, email_verification_token: __, ...userWithoutPassword } = {
      ...user,
      email_verified: true,
      email_verification_token: null,
      email_verification_expires: null
    };

    res.json({
      message: 'Email verified successfully! Logging you in...',
      token: tokenPayload,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend Verification Email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new token
    const verificationToken = generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verification_token: verificationToken,
        email_verification_expires: verificationExpires.toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    await sendVerificationEmail(email, verificationToken, user.name);

    res.json({ message: 'Verification email sent! Please check your inbox.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verification status (used by verification waiting page auto-poll)
router.get('/verification-status', async (req, res) => {
  try {
    const email = (req.query.email || '').toString().trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email_verified')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(404).json({ verified: false, message: 'User not found' });
    }

    res.json({ verified: Boolean(user.email_verified) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ verified: false, message: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Don't reveal if user exists
      return res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
    }

    // Don't allow password reset for Google-only users
    if (user.is_google_user && !user.password) {
      return res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    await sendPasswordResetEmail(email, resetToken, user.name);

    res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('password_reset_token', token)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    // Check if token expired
    if (new Date(user.password_reset_expires) < new Date()) {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password reset successful! You can now login with your new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate Reset Token
router.get('/validate-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, password_reset_expires')
      .eq('password_reset_token', token)
      .single();

    if (error || !user) {
      return res.status(400).json({ valid: false, message: 'Invalid reset link' });
    }

    if (new Date(user.password_reset_expires) < new Date()) {
      return res.status(400).json({ valid: false, message: 'Reset link has expired' });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ valid: false, message: 'Server error' });
  }
});

module.exports = router;
