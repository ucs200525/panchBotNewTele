/**
 * AI Core — Session Store v2.0 (MongoDB Persistent)
 * Uses MongoDB to ensure chat history and context survive server restarts.
 * Modified: Gracefully and instantly bypasses MongoDB when offline (readyState !== 1)
 * to avoid startup exceptions when bufferCommands = false.
 */

const AiSession = require('../../models/AiSession');
const mongoose = require('mongoose');

/**
 * Get session data by ID
 */
async function getSession(sessionId) {
  // Bypass database read instantly if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    return {};
  }
  try {
    const session = await AiSession.findOne({ sessionId });
    if (!session) return {};
    
    // Update lastAccessed for TTL
    session.lastAccessed = new Date();
    await session.save();
    
    return {
      userProfile: session.userProfile,
      history: session.history
    };
  } catch (error) {
    console.error('[SessionStore] Error in getSession:', error);
    return {};
  }
}

/**
 * Update or create session
 */
async function updateSession(sessionId, data) {
  // Bypass database write instantly if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  try {
    let session = await AiSession.findOne({ sessionId });
    
    if (!session) {
      session = new AiSession({ sessionId, userProfile: data.userProfile || {} });
    } else if (data.userProfile) {
      session.userProfile = { ...session.userProfile, ...data.userProfile };
    }
 
    if (data.historyItems && Array.isArray(data.historyItems)) {
      session.history.push(...data.historyItems);
      // Keep only last 30 messages (15 conversation turns) in persistent storage
      if (session.history.length > 30) {
        session.history = session.history.slice(session.history.length - 30);
      }
    }
 
    session.lastAccessed = new Date();
    await session.save();
  } catch (error) {
    console.error('[SessionStore] Error in updateSession:', error);
  }
}

/**
 * Clear a specific session (Delete Chat)
 */
async function clearSession(sessionId) {
  if (!sessionId || mongoose.connection.readyState !== 1) return;
  try {
    await AiSession.deleteOne({ sessionId });
  } catch (error) {
    console.error('[SessionStore] Error in clearSession:', error);
  }
}

/**
 * List all sessions for a user (History Drawer)
 */
async function listSessions(prefix) {
  // Bypass database query instantly if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  try {
    // Find all sessions starting with the prefix
    const sessions = await AiSession.find({ 
      sessionId: { $regex: '^' + prefix } 
    }).sort({ updatedAt: -1 });
 
    return sessions.map(s => {
      const firstUserMsg = s.history.find(m => m.role === 'user')?.content || 'New Conversation';
      return {
        id: s.sessionId,
        title: firstUserMsg.length > 30 ? firstUserMsg.substring(0, 30) + '...' : firstUserMsg,
        timestamp: s.updatedAt
      };
    });
  } catch (error) {
    console.error('[SessionStore] Error in listSessions:', error);
    return [];
  }
}

module.exports = { getSession, updateSession, clearSession, listSessions };
