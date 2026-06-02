import React, { useState, useEffect } from 'react';
import styles from './PersonalAdvisorCard.module.css'; // Let's use custom advisor styling
import { ProfileService } from '../utils/profileService';
import { useBirthProfiles } from '../context/BirthProfileContext';
import ProfileSelector from '../components/common/ProfileSelector';

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", 
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", 
  "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", 
  "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", 
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const RASHIS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", 
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
];

// Custom lightweight markdown renderer to convert tags into styled HTML nodes
const renderMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let cleanLine = line.trim();
    
    // Headings: ### Title
    if (cleanLine.startsWith('###')) {
      const headingText = cleanLine.replace('###', '').trim();
      return (
        <h4 key={idx} style={{ 
          color: '#ff8c42', 
          marginTop: '16px', 
          marginBottom: '8px', 
          fontSize: '1.2rem', 
          fontWeight: 700,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '4px'
        }}>
          {parseInlineMarkdown(headingText)}
        </h4>
      );
    }
    
    // Bullet lists: * Text or - Text or ✓ or ✗
    if (cleanLine.startsWith('*') || cleanLine.startsWith('-') || cleanLine.startsWith('✓') || cleanLine.startsWith('✗')) {
      const bulletChar = cleanLine[0];
      const listText = cleanLine.substring(1).trim();
      const color = bulletChar === '✓' ? '#a3e635' : bulletChar === '✗' ? '#fda4af' : '#ff8c42';
      return (
        <div key={idx} style={{ display: 'flex', gap: '8px', marginLeft: '8px', marginBottom: '4px', fontSize: '0.94rem', color: '#cbd5e0' }}>
          <span style={{ color, fontWeight: 'bold' }}>{bulletChar}</span>
          <span>{parseInlineMarkdown(listText)}</span>
        </div>
      );
    }
    
    // Empty line
    if (!cleanLine) {
      return <div key={idx} style={{ height: '8px' }} />;
    }
    
    // Normal paragraph line
    return (
      <p key={idx} style={{ margin: '0 0 8px 0', fontSize: '0.96rem', lineHeight: '1.6', color: '#cbd5e0' }}>
        {parseInlineMarkdown(line)}
      </p>
    );
  });
};

const parseInlineMarkdown = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const PersonalizedAdvisor = () => {
  const { selectedProfile } = useBirthProfiles();
  const [city, setCity] = useState("Hyderabad");
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [name, setName] = useState("");
  const [nakshatra, setNakshatra] = useState("");
  const [rashi, setRashi] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [error, setError] = useState("");

  // Sync with selected birth profile
  useEffect(() => {
    if (selectedProfile) {
      setName(selectedProfile.name);
      setNakshatra(selectedProfile.nakshatra || "");
      setRashi(selectedProfile.rashi || "");
      setBirthDate(selectedProfile.dob || "");
      setBirthTime(selectedProfile.time || "");
      setCity(selectedProfile.city || "Hyderabad");
    } else {
      // Fallback to local profile service storage if no profile selected
      const local = ProfileService.getLocalProfile();
      if (local.name) {
        setName(local.name);
        setNakshatra(local.nakshatra || "");
        setRashi(local.rashi || "");
        setBirthDate(local.dob || "");
        setBirthTime(local.time || "");
        setCity(local.city || "Hyderabad");
      }
    }
  }, [selectedProfile]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReport(null);
    setTimeline(null);

    // Save details to MongoDB central storage
    await ProfileService.saveProfile({
      name,
      nakshatra,
      rashi,
      city,
      dob: birthDate,
      time: birthTime,
      lat: localStorage.getItem('astro_lat'),
      lng: localStorage.getItem('astro_lng')
    });


    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      
      const [adviceRes, timelineRes] = await Promise.all([
        fetch(`${apiUrl}/api/personalized-advice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city,
            date,
            name,
            birthNakshatra: nakshatra,
            birthRashi: rashi
          })
        }),
        fetch(`${apiUrl}/api/ai-astrologer/muhurat-timeline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city,
            date,
            name,
            birthNakshatra: nakshatra,
            birthRashi: rashi,
            lat: localStorage.getItem('astro_lat'),
            lng: localStorage.getItem('astro_lng')
          })
        })
      ]);

      if (!adviceRes.ok) {
        throw new Error("Unable to contact calculation backend. Please try again.");
      }

      const adviceData = await adviceRes.json();
      setReport(adviceData);

      if (timelineRes.ok) {
        const timelineData = await timelineRes.json();
        if (timelineData.success) {
          setTimeline(timelineData.timeline);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const clearProfile = () => {
    localStorage.removeItem('astro_name');
    localStorage.removeItem('astro_nakshatra');
    localStorage.removeItem('astro_rashi');
    localStorage.removeItem('astro_birth_date');
    localStorage.removeItem('astro_birth_time');
    setName("");
    setNakshatra("");
    setRashi("");
    setBirthDate("");
    setBirthTime("");
    setReport(null);
    setTimeline(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <span className={styles.badge}>🕉️ ASTRO DECISION ENGINE</span>
        <h1 className={styles.title}>Personalized Daily Astro Advisor</h1>
        <p className={styles.subtitle}>
          Harmonize your actions with real-time celestial transits computed with precision Swiss Ephemeris data.
        </p>
        <ProfileSelector />
      </div>

      <div className={styles.grid}>
        {/* Profile Card / Setup */}
        <div className={styles.setupCard}>
          <div className={styles.glassHeader}>
            <h3>👤 Setup Your Astro Profile</h3>
            <p>Calculates custom Tara Bala and Chandra Bala alignments</p>
          </div>
          
          <form onSubmit={handleGenerate} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>What's your name?</label>
              <input 
                type="text" 
                placeholder="Enter Name"
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>Birth Star (Nakshatra)</label>
                <select value={nakshatra} onChange={e => setNakshatra(e.target.value)} required>
                  <option value="">Select Nakshatra</option>
                  {NAKSHATRAS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Moon Sign (Rashi)</label>
                <select value={rashi} onChange={e => setRashi(e.target.value)} required>
                  <option value="">Select Rashi</option>
                  {RASHIS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>Your City</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Target Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>Date of Birth</label>
                <input 
                  type="date" 
                  value={birthDate} 
                  onChange={e => setBirthDate(e.target.value)} 
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Time of Birth</label>
                <input 
                  type="time" 
                  value={birthTime} 
                  onChange={e => setBirthTime(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className={styles.actionRow}>
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Consulting Swiss Ephemeris...' : 'Generate Auspicious Guide'}
              </button>
              {(name || nakshatra || rashi) && (
                <button type="button" onClick={clearProfile} className={styles.clearBtn}>
                  Reset Profile
                </button>
              )}
            </div>
          </form>

          {error && <div className={styles.errorBox}>⚠️ {error}</div>}
        </div>

        {/* Report / Advisory Area */}
        <div className={styles.resultsArea}>
          {loading && (
            <div className={styles.loadingPulse}>
              <div className={styles.spinner}></div>
              <p>Performing 18 discrete stellar checks...</p>
            </div>
          )}

          {!loading && !report && (
            <div className={styles.placeholderCard}>
              <div className={styles.placeholderIcon}>🌌</div>
              <h3>Await Celestial Report</h3>
              <p>Enter your profile details on the left to compute live Tara Bala and Chandra Bala strengths.</p>
            </div>
          )}

          {report && (
            <div className={styles.reportBox}>
              <div className={styles.reportHeader}>
                <div>
                  <span className={styles.liveTag}>● LIVE TRANSIT MATRIX</span>
                  <h2>Auspicious Insights for {name}</h2>
                </div>
                <div className={styles.overallIndicator}>
                  <span className={styles.boldScore}>
                    {Math.round((report.evaluations.travel.score + report.evaluations.business.score + report.evaluations.wellness.score) / 3)}%
                  </span>
                  <span className={styles.scoreSub}>Aura Power</span>
                </div>
              </div>

              {/* Strength Indicators */}
              <div className={styles.strengthRow}>
                <div className={styles.strengthBox}>
                  <div className={styles.strengthTitle}>🎯 TARA BALA (Stellar Force)</div>
                  <div className={styles.strengthName}>{report.taraBala.name}</div>
                  <div className={styles.strengthRating} data-rating={report.taraBala.rating}>
                    {report.taraBala.rating} • Score: {report.taraBala.score}%
                  </div>
                  <p className={styles.strengthDesc}>{report.taraBala.description}</p>
                </div>

                <div className={styles.strengthBox}>
                  <div className={styles.strengthTitle}>🧠 CHANDRA BALA (Mental Focus)</div>
                  <div className={styles.strengthName}>Moon in House {report.chandraBala.house}</div>
                  <div className={styles.strengthRating} data-rating={report.chandraBala.rating}>
                    {report.chandraBala.rating} • Score: {report.chandraBala.score}%
                  </div>
                  <p className={styles.strengthDesc}>{report.chandraBala.description}</p>
                </div>
              </div>

              {/* Domain Scores */}
              <h3 className={styles.sectionTitle}>🎯 Activity Auspiciousness Metrics</h3>
              <div className={styles.scoresGrid}>
                {Object.entries(report.evaluations).map(([activity, val]) => (
                  <div key={activity} className={styles.activityCard}>
                    <div className={styles.activityHead}>
                      <span className={styles.activityName}>
                        {activity === 'travel' ? '🚗 Travel & Journeys' : 
                         activity === 'business' ? '💼 Deals & Commerce' : '❤️ Wellness & Health'}
                      </span>
                      <span className={styles.activityScore} data-score-tier={val.score >= 70 ? 'high' : val.score >= 50 ? 'med' : 'low'}>
                        {val.score}%
                      </span>
                    </div>
                    <div className={styles.scoreBarBg}>
                      <div className={styles.scoreBarFill} style={{ width: `${val.score}%` }} data-score-tier={val.score >= 70 ? 'high' : val.score >= 50 ? 'med' : 'low'}></div>
                    </div>
                    <p className={styles.activitySummary}>{val.summary}</p>
                    
                    {val.rulesMet.length > 0 && (
                      <div className={styles.rulesList}>
                        {val.rulesMet.map((r, i) => <div key={i} className={styles.ruleMet}>✓ {r}</div>)}
                      </div>
                    )}
                    {val.rulesBroken.length > 0 && (
                      <div className={styles.rulesList}>
                        {val.rulesBroken.map((r, i) => <div key={i} className={styles.ruleBroken}>✗ {r}</div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Daily Chronological Timeline Removed per user request */}

              {/* Markdown summary */}
              <h3 className={styles.sectionTitle}>🔮 Holistic Astrological Strategy</h3>
              <div className={styles.markdownBox}>
                <div className={styles.preText}>{renderMarkdown(report.formattedAdviceMarkdown)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedAdvisor;
