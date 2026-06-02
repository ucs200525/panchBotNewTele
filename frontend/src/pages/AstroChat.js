import React, { useState, useEffect, useRef } from 'react';
import styles from './AstroChat.module.css';
import { ProfileService } from '../utils/profileService';
import { useBirthProfiles } from '../context/BirthProfileContext';
import ProfileSelector from '../components/common/ProfileSelector';



// Smart renderer: handles plain-text structured output + legacy markdown + tables
const parseInlineMarkdown = (text) => {
  if (!text) return text;
  
  // Handle Images: ![alt](url)
  const parts = text.split(/(!\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const [_, alt, src] = imgMatch;
      // Use relative path if it's our API, otherwise absolute
      const finalSrc = (src.startsWith('/api') || src.startsWith('api')) ? src : src;
      return (
        <div key={`img-${i}`} style={{ margin: '15px 0', textAlign: 'center' }}>
          <img 
            src={finalSrc} 
            alt={alt} 
            loading="lazy"
            style={{ 
              maxWidth: '100%', 
              width: '400px', // Standardized width
              borderRadius: '12px', 
              border: '2px solid rgba(168, 85, 247, 0.4)', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              display: 'block',
              margin: '0 auto',
              background: 'rgba(0,0,0,0.03)'
            }} 
            onLoad={(e) => { e.target.style.opacity = 1; }}
            onError={(e) => { 
              e.target.style.display = 'none'; 
            }}
          />
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px', fontWeight: 600 }}>{alt}</div>
        </div>
      );

    }

    // Handle Bold: **text**
    let formatted = part.split(/(\*\*.*?\*\*)/g).map((subPart, si) =>
      subPart.startsWith('**') && subPart.endsWith('**')
        ? <strong key={`bold-${i}-${si}`} style={{ color: '#1e293b', fontWeight: 700 }}>{subPart.slice(2, -2)}</strong>
        : subPart
    );

    // Handle Italics: *text*
    formatted = formatted.map((sub, idx) => {
        if (typeof sub !== 'string') return sub;
        return sub.split(/(\*.*?\*)/g).map((subPart, si) => 
            subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2
                ? <em key={`italic-${idx}-${si}`} style={{ color: '#475569', fontStyle: 'italic' }}>{subPart.slice(1, -1)}</em>
                : subPart
        );
    });
    
    return formatted;
  });
};



const renderMarkdown = (text) => {
  if (!text) return null;
  const rawLines = text.split('\n');
  const elements = [];
  let tableBuffer = [];

  const flushTable = (key) => {
    if (!tableBuffer.length) return;
    const rows = [...tableBuffer];
    tableBuffer = [];
    const content = rows.filter(r => !r.trim().match(/^\|(?:\s*:?-+:?\s*\|)+$/));
    if (!content.length) return;
    const hasHead = rows.length > 1;
    const headerCols = hasHead
      ? content[0].split('|').map(s => s.trim()).filter((_, i) => i > 0 && i < content[0].split('|').length - 1)
      : [];
    const bodyRows = hasHead ? content.slice(1) : content;
    elements.push(
      <div key={key} style={{ overflowX: 'auto', margin: '12px 0', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          {hasHead && <thead style={{ background: '#eef2ff', borderBottom: '1px solid #e2e8f0' }}>
            <tr>{headerCols.map((col, ci) => <th key={ci} style={{ padding: '9px 13px', color: '#1e293b', fontWeight: 700 }}>{parseInlineMarkdown(col)}</th>)}</tr>
          </thead>}
          <tbody>
            {bodyRows.map((row, ri) => {
              const cols = row.split('|').map(s => s.trim()).filter((_, i) => i > 0 && i < row.split('|').length - 1);
              return (
                <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', background: ri % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  {cols.map((col, ci) => <td key={ci} style={{ padding: '7px 13px', color: '#475569' }}>{parseInlineMarkdown(col)}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const cl = line.trim();

    // Table row
    if (cl.startsWith('|')) { tableBuffer.push(line); continue; }
    if (tableBuffer.length > 0) flushTable(`tbl-${i}`);

    // Empty
    if (!cl) { elements.push(<div key={`g-${i}`} style={{ height: '6px' }} />); continue; }

    // Separator line
    if (/^[-─═─]{3,}$/.test(cl)) {
      elements.push(<hr key={`hr-${i}`} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />);
      continue;
    }

    // #### heading
    if (cl.startsWith('####')) {
      elements.push(<h4 key={`h4-${i}`} style={{ color: '#4338ca', marginTop: '12px', marginBottom: '4px', fontSize: '1rem', fontWeight: 700 }}>{parseInlineMarkdown(cl.replace(/^####\s*/, ''))}</h4>);
      continue;
    }

    // ### heading
    if (cl.startsWith('###')) {
      elements.push(<h4 key={`h3-${i}`} style={{ color: '#4338ca', marginTop: '14px', marginBottom: '6px', fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>{parseInlineMarkdown(cl.replace(/^###\s*/, ''))}</h4>);
      continue;
    }

    // ## heading
    if (cl.startsWith('##')) {
      elements.push(<h3 key={`h2-${i}`} style={{ color: '#1e293b', marginTop: '16px', marginBottom: '8px', fontSize: '1.15rem', fontWeight: 800 }}>{parseInlineMarkdown(cl.replace(/^##\s*/, ''))}</h3>);
      continue;
    }

    // Blockquote
    if (cl.startsWith('>')) {
      elements.push(
        <div key={`bq-${i}`} style={{ borderLeft: '4px solid #6366f1', background: '#eef2ff', padding: '8px 12px', margin: '8px 0', borderRadius: '0 8px 8px 0', color: '#334155', fontStyle: 'italic', fontSize: '0.92rem' }}>
          {parseInlineMarkdown(cl.replace(/^>\s*/, ''))}
        </div>
      );
      continue;
    }

    // Section header: emoji line ending with colon OR containing em-dash
    if (/[🌟✅📅⛔☀️👤⚠️🔮🪐🌌]/.test(cl) && (cl.endsWith(':') || cl.includes('—') || cl.includes('–'))) {
      elements.push(
        <div key={`sec-${i}`} style={{ color: '#6366f1', fontWeight: 700, fontSize: '0.95rem', marginTop: '14px', marginBottom: '4px' }}>
          {parseInlineMarkdown(cl)}
        </div>
      );
      continue;
    }

    // Indented line (2+ spaces) — slot/sub entries
    if (/^ {2,}/.test(line) && cl.length > 0) {
      const danger = cl.startsWith('⛔') ? '#ef4444' : cl.startsWith('✅') ? '#16a34a' : cl.startsWith('☀️') ? '#d97706' : null;
      elements.push(
        <div key={`ind-${i}`} style={{ paddingLeft: '18px', marginBottom: '3px', fontSize: '0.88rem', color: danger || '#64748b', lineHeight: 1.5 }}>
          {parseInlineMarkdown(cl)}
        </div>
      );
      continue;
    }

    // Bullet: * or - or • at start
    if (/^[*\-•]\s/.test(cl)) {
      elements.push(
        <div key={`li-${i}`} style={{ display: 'flex', gap: '8px', marginLeft: '4px', marginBottom: '5px', fontSize: '0.95rem', color: '#1e293b', alignItems: 'flex-start' }}>
          <span style={{ color: '#6366f1', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>•</span>
          <span>{parseInlineMarkdown(cl.replace(/^[*\-•]\s/, ''))}</span>
        </div>
      );
      continue;
    }

    // Numbered list "1. ..."
    if (/^\d+\.\s/.test(cl)) {
      elements.push(
        <div key={`nl-${i}`} style={{ display: 'flex', gap: '8px', marginLeft: '4px', marginBottom: '5px', fontSize: '0.95rem', color: '#1e293b', alignItems: 'flex-start' }}>
          <span style={{ color: '#6366f1', fontWeight: 700, flexShrink: 0 }}>{cl.match(/^(\d+)\./)?.[1]}.</span>
          <span>{parseInlineMarkdown(cl.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
      continue;
    }

    // Default paragraph
    elements.push(<p key={`p-${i}`} style={{ margin: '0 0 8px 0', fontSize: '0.95rem', lineHeight: 1.65, color: '#334155' }}>{parseInlineMarkdown(line)}</p>);
  }

  if (tableBuffer.length > 0) flushTable('tbl-final');
  return elements;
};


const QUICK_PROMPTS_SIDEBAR = [
  { text: "What is my Lagna?", icon: "🌅" },
  { text: "Best Muhurat today", icon: "⏰" },
  { text: "My birth Nakshatra?", icon: "⭐" },
  { text: "Is today good for business?", icon: "📈" },
  { text: "Best travel time today", icon: "🚗" },
];

const SUGGESTION_CHIPS = [
  "What is my Lagna?",
  "Travel Muhurat today",
  "Auspicious business time",
  "My birth Nakshatra?",
];

const AstroChat = () => {
  const { selectedProfile } = useBirthProfiles();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("🔭 Initiating Vedic Engine...");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(() => localStorage.getItem('astro_chat_session_id'));
  const [profile, setProfile] = useState({ name: "", nakshatra: "", rashi: "", dob: "", time: "", lat: "", lng: "" });
  const [city, setCity] = useState("Hyderabad");
  const [date] = useState(() => new Date().toISOString().substring(0, 10));
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", dob: "", time: "", city: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Sync profile context from selected profile
  useEffect(() => {
    if (selectedProfile) {
      setProfile({
        name: selectedProfile.name,
        dob: selectedProfile.dob || '',
        time: selectedProfile.time || '',
        city: selectedProfile.city || '',
        lat: selectedProfile.lat || '',
        lng: selectedProfile.lng || '',
        nakshatra: selectedProfile.nakshatra || '',
        rashi: selectedProfile.rashi || ''
      });
      setCity(selectedProfile.city || 'Hyderabad');
      fetchSessions(selectedProfile.name, selectedProfile.city || 'Hyderabad');
    }
  }, [selectedProfile]);
  const [thinkingStep, setThinkingStep] = useState(0);
  const thinkingIntervalRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const THINKING_STEPS = [
    "🔭 Reading your birth chart...",
    "⚙️ Computing Lagna & Ascendant...",
    "🌙 Analyzing Moon & Nakshatra...",
    "🪐 Mapping planetary positions...",
    "⏳ Calculating Vimshottari Dasha...",
    "📅 Checking today's Panchang...",
    "✍️ Composing your reading...",
  ];

  const startNewChat = () => {
    setCurrentSessionId(null);
    localStorage.removeItem('astro_chat_session_id');
    setMessages([]);
    if (window.innerWidth <= 900) setSidebarOpen(false);
  };

  const handleSaveSettings = async () => {
    setEditError("");
    if (!editForm.name.trim()) return setEditError("Name is required");
    if (!editForm.city.trim()) return setEditError("City is required");
    if (!editForm.dob) return setEditError("Birth Date is required");
    if (!editForm.time) return setEditError("Birth Time is required");

    setEditLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      
      // 1. Resolve coordinates for the city
      const coordsRes = await fetch(`${apiUrl}/api/fetchCoordinates/${encodeURIComponent(editForm.city.trim())}`);
      if (!coordsRes.ok) throw new Error("City not found. Please check spelling.");
      const coords = await coordsRes.json();
      
      // 2. Fetch Nakshatra and Rashi calculation from backend
      const calcRes = await fetch(`${apiUrl}/api/calculate-birth-details?dob=${editForm.dob}&time=${editForm.time}&lat=${coords.lat}&lng=${coords.lng}`);
      let nakshatraVal = "", rashiVal = "";
      if (calcRes.ok) {
        const calcData = await calcRes.json();
        nakshatraVal = calcData.nakshatra || "";
        rashiVal = calcData.rashi || "";
      }

      // 3. Save profile (this calls ProfileService which syncs to DB if logged in, otherwise local)
      const updatedProfile = await ProfileService.saveProfile({
        name: editForm.name.trim(),
        dob: editForm.dob,
        time: editForm.time,
        city: editForm.city.trim(),
        lat: coords.lat,
        lng: coords.lng,
        nakshatra: nakshatraVal,
        rashi: rashiVal
      });

      // 4. Update local state
      setProfile(updatedProfile);
      setCity(updatedProfile.city);
      setIsEditingSettings(false);
      
      // Print context update to user via bot message to make it extremely premium
      setMessages(prev => [...prev, {
        sender: "bot",
        text: `### ⚙️ Settings Saved Successfully\n\nI have updated your cosmic profile settings directly in our database:\n\n- **Name:** ${updatedProfile.name}\n- **Birth Date:** ${updatedProfile.dob}\n- **Birth Time:** ${updatedProfile.time}\n- **Place:** ${updatedProfile.city} (resolved to Lat: ${coords.lat.toFixed(4)}°, Lng: ${coords.lng.toFixed(4)}°)\n- **Janma Nakshatra:** ${updatedProfile.nakshatra || "Auto-calculating"}\n- **Rashi:** ${updatedProfile.rashi || "Auto-calculating"}\n\nYour profile is 100% complete and fully synchronized. Ask me anything about your Lagna or auspicious times now!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setEditError(err.message || "Failed to update profile settings.");
    } finally {
      setEditLoading(false);
    }
  };

  const switchSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    localStorage.setItem('astro_chat_session_id', sessionId);
    if (window.innerWidth <= 900) setSidebarOpen(false);
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const todayStr = new Date().toISOString().substring(0, 10);
      const res = await fetch(`${apiUrl}/api/ai/history?sessionId=${encodeURIComponent(sessionId)}&date=${todayStr}`);
      if (res.ok) {
        const data = await res.json();
        setMessages((data.history || []).map(item => ({
          sender: item.role === 'user' ? 'user' : 'bot',
          text: item.content,
          time: 'Previous',
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this chat?")) return;
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      await fetch(`${apiUrl}/api/clear-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      fetchSessions(profile.name, city);
      if (currentSessionId === sessionId) startNewChat();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Clear this conversation?")) return;
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      await fetch(`${apiUrl}/api/clear-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, city, sessionId: currentSessionId }),
      });
      startNewChat();
      fetchSessions(profile.name, city);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async (name, cityName) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${apiUrl}/api/ai/sessions?name=${encodeURIComponent(name || '')}&city=${encodeURIComponent(cityName || '')}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const local = ProfileService.getLocalProfile();
      let name = '', cityVal = 'Hyderabad';
      if (local?.name) {
        setProfile({ ...local });
        cityVal = local.city || 'Hyderabad';
        name = local.name;
        setCity(cityVal);
      }
      const db = await ProfileService.fetchProfile();
      if (db?.name) {
        setProfile({ ...db });
        cityVal = db.city || 'Hyderabad';
        name = db.name;
        setCity(cityVal);
      }
      
      // Load session history if we have a saved ID
      const savedSessionId = localStorage.getItem('astro_chat_session_id');
      if (savedSessionId) {
        switchSession(savedSessionId);
      }
      
      fetchSessions(name, cityVal);
    };
    init();
  }, []);

  const handleSendMessage = async (text) => {
    const msgText = (text || inputValue).trim();
    if (!msgText || loading) return;

    const userMsg = { sender: "user", text: msgText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const chatHeaders = { 'Content-Type': 'application/json' };
      const token = ProfileService.getToken();
      if (token) {
        chatHeaders['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiUrl}/api/ai/chat?stream=true`, {
        method: 'POST',
        headers: chatHeaders,
        body: JSON.stringify({
          message: msgText,
          history: messages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
          sessionId: currentSessionId,
          city,
          date,
          ...profile,
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partialData = "";
      let finalData = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        partialData += decoder.decode(value, { stream: true });
        
        const lines = partialData.split('\n');
        partialData = lines.pop(); // keep incomplete line
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === 'status') {
              setThinkingMessage(parsed.message);
            } else if (parsed.type === 'result') {
              finalData = parsed.data;
            } else if (parsed.type === 'error') {
              throw new Error(parsed.data.error || "Streaming error");
            }
          } catch (e) {
            console.warn("Could not parse NDJSON line:", line);
          }
        }
      }

      if (!finalData) throw new Error("No final response received");
      const data = finalData;

      // If the AI updated the user's birth details during the chat session,
      // propagate it back into the local state and localStorage instantly!
      if (data.userProfile) {
        ProfileService.syncToLocal(data.userProfile);
        const merged = {
          name: data.userProfile.name || '',
          dob: data.userProfile.dob || '',
          time: data.userProfile.time || '',
          city: data.userProfile.city || '',
          lat: data.userProfile.lat || '',
          lng: data.userProfile.lng || '',
          nakshatra: data.userProfile.nakshatra || '',
          rashi: data.userProfile.rashi || ''
        };
        setProfile(prev => ({ ...prev, ...Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== '')) }));
        if (data.userProfile.city) setCity(data.userProfile.city);
        // Close settings form and pre-fill with newly saved values so
        // reopening shows the correct data instead of the stale/empty form
        setIsEditingSettings(false);
        setEditForm(prev => ({
          name: data.userProfile.name || prev.name,
          dob: data.userProfile.dob || prev.dob,
          time: data.userProfile.time || prev.time,
          city: data.userProfile.city || prev.city
        }));
      }

      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId);
        localStorage.setItem('astro_chat_session_id', data.sessionId);
        fetchSessions(profile.name || data.userProfile?.name || '', city);
      }
      setMessages(prev => [...prev, {
        sender: "bot",
        text: data.formattedResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "bot", text: "⚠️ Connection error. Please check the server.", time: "" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (loading) {
      setThinkingMessage("🔭 Initiating Vedic Engine...");
    }
  }, [loading]);

  const isMobile = window.innerWidth <= 900;

  return (
    <div className={styles.pageEscape}>
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className={`${styles.mobileBackdrop} ${styles.mobileBackdropVisible}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? (isMobile ? styles.sidebarOpen : '') : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <button className={styles.newChatBtn} onClick={startNewChat}>
            ✏️ New chat
          </button>
          <button className={styles.closeSidebarBtn} onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>

        <div className={styles.sidebarScroll}>
          {/* Profile Context */}
          <div className={styles.sidebarSection}>
            <ProfileSelector />
            <div className={styles.contextHeader}>
              <div className={styles.sectionLabel}>Your Context</div>
              {!isEditingSettings && (
                <button 
                  className={styles.editContextBtn}
                  onClick={() => {
                    setEditForm({
                      name: profile.name || "",
                      dob: profile.dob || "",
                      time: profile.time || "",
                      city: city || ""
                    });
                    setEditError("");
                    setIsEditingSettings(true);
                  }}
                >
                  ⚙️ Settings
                </button>
              )}
            </div>

            {isEditingSettings ? (
              <div className={styles.settingsForm}>
                <div className={styles.formTitle}>Edit Birth Profile</div>
                {editError && <div className={styles.formError}>{editError}</div>}
                
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Shiva Kumar"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Birth City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Hyderabad"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Birth Date</label>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dob: e.target.value }))}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Birth Time</label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    className={styles.saveSettingsBtn}
                    onClick={handleSaveSettings}
                    disabled={editLoading}
                  >
                    {editLoading ? "Saving..." : "Save"}
                  </button>
                  <button 
                    className={styles.cancelSettingsBtn}
                    onClick={() => setIsEditingSettings(false)}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.contextCard}>
                <div className={styles.contextRow}>
                  <span className={styles.contextLabel}>Name</span>
                  <span className={styles.contextValue}>{profile.name || "Seeker"}</span>
                </div>
                <div className={styles.contextRow}>
                  <span className={styles.contextLabel}>City</span>
                  <span className={styles.contextValue}>📍 {city}</span>
                </div>
                <div className={styles.contextRow}>
                  <span className={styles.contextLabel}>Nakshatra</span>
                  <span className={styles.contextValue}>{profile.nakshatra || "General"}</span>
                </div>
                {profile.rashi && (
                  <div className={styles.contextRow}>
                    <span className={styles.contextLabel}>Rashi</span>
                    <span className={styles.contextValue}>{profile.rashi}</span>
                  </div>
                )}
                {profile.dob && (
                  <div className={styles.contextRow}>
                    <span className={styles.contextLabel}>Birth Date</span>
                    <span className={styles.contextValue}>{profile.dob}</span>
                  </div>
                )}
                {profile.time && (
                  <div className={styles.contextRow}>
                    <span className={styles.contextLabel}>Birth Time</span>
                    <span className={styles.contextValue}>{profile.time}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className={styles.sidebarSection}>
            <div className={styles.quickPromptsLabel}>Quick Queries</div>
            <div className={styles.promptsList}>
              {QUICK_PROMPTS_SIDEBAR.map((p, i) => (
                <button
                  key={i}
                  className={styles.promptBtn}
                  onClick={() => handleSendMessage(p.text)}
                  disabled={loading}
                >
                  <span className={styles.promptIcon}>{p.icon}</span>
                  <span className={styles.promptText}>{p.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          <div className={styles.sidebarSection}>
            <div className={styles.sectionLabel}>History</div>
            {sessions.length > 0 ? (
              sessions.map(s => (
                <div
                  key={s.id}
                  className={`${styles.sessionItem} ${currentSessionId === s.id ? styles.activeSession : ''}`}
                  onClick={() => switchSession(s.id)}
                >
                  <div className={styles.sessionTitle}>💬 {s.title}</div>
                  <button className={styles.deleteBtn} onClick={(e) => handleDeleteSession(e, s.id)}>✕</button>
                </div>
              ))
            ) : (
              <div className={styles.emptySessions}>No chat history yet</div>
            )}
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <button className={styles.clearHistoryBtn} onClick={handleClearChat}>
            🗑️ Clear all conversations
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            {!sidebarOpen && (
              <button className={styles.openSidebarBtn} onClick={() => setSidebarOpen(true)}>
                ☰
              </button>
            )}
            <div className={styles.engineBadge}>
              <div className={styles.statusDot}></div>
              <span>Vedic Engine Active</span>
            </div>
          </div>
          <div className={styles.topBarRight}>
            <button className={styles.clearBtn} onClick={handleClearChat}>
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className={styles.chatContainer}>
          <div className={styles.messagesFeed}>
            {/* Empty State */}
            {messages.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🕉️</div>
                <h2 className={styles.emptyStateTitle}>Vedic Astro Copilot</h2>
                <p className={styles.emptyStateSubtitle}>
                  Ask about your Lagna, Nakshatra, auspicious Muhurat windows, or any personalised planetary query.
                </p>
                <div className={styles.emptySuggestions}>
                  {SUGGESTION_CHIPS.map((s, i) => (
                    <button key={i} className={styles.emptyChip} onClick={() => handleSendMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((m, idx) => (
              <div key={idx} className={`${styles.messageRow} ${m.sender === 'user' ? styles.userRow : styles.botRow}`}>
                <div className={`${styles.messageInner} ${m.sender === 'user' ? styles.userInner : styles.botInner}`}>
                  <div className={`${styles.avatar} ${m.sender === 'user' ? styles.userAvatar : styles.botAvatar}`}>
                    {m.sender === 'user' ? (profile.name?.[0]?.toUpperCase() || 'U') : '🕉'}
                  </div>
                  <div className={`${styles.messageBubble} ${m.sender === 'user' ? styles.userBubble : styles.botBubble}`}>
                    {renderMarkdown(m.text)}
                    {m.time && <span className={styles.messageTime}>{m.time}</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Thinking Indicator */}
            {loading && (
              <div className={`${styles.messageRow} ${styles.botRow}`}>
                <div className={`${styles.messageInner} ${styles.botInner}`}>
                  <div className={`${styles.avatar} ${styles.botAvatar}`}>🕉</div>
                  <div className={styles.thinkingCard}>
                    <div className={styles.thinkingHeader}>
                      <span className={styles.thinkingPulse}></span>
                      <span className={styles.thinkingLabel}>Thinking</span>
                    </div>
                    <div className={styles.thinkingStep}>
                      {thinkingMessage}
                    </div>
                    <div className={styles.thinkingDots}>
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <div className={styles.inputInner}>
              {messages.length < 2 && (
                <div className={styles.suggestionChips}>
                  {SUGGESTION_CHIPS.map((s, i) => (
                    <button key={i} className={styles.suggestionChip} onClick={() => handleSendMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <form
                className={styles.inputForm}
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              >
                <textarea
                  ref={inputRef}
                  placeholder="Ask about Lagna, Nakshatra, Muhurat..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                />
                <button type="submit" className={styles.sendBtn} disabled={loading || !inputValue.trim()}>
                  ➤
                </button>
              </form>
              <div className={styles.inputHint}>Press Enter to send · Shift+Enter for new line</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AstroChat;

