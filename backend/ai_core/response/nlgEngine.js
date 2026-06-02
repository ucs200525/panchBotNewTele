/**
 * AI Core — Natural Language Generation (NLG) Engine v4.0
 * Converts computed astrological results into premium, localized responses.
 */

const nakshatraInterpreter = require('../../utils/nakshatraInterpreter');
const planetInterpreter = require('../../utils/planetInterpreter');
const { formatTime } = require('../../utils/timeUtils');

/**
 * Generate a complete response based on the action plan and computed results.
 */
const zodiacMap = {
  Mesha: "♈", Vrishabha: "♉", Mithuna: "♊", Karka: "♋",
  Simha: "♌", Kanya: "♍", Tula: "♎", Vrischika: "♏",
  Dhanu: "♐", Makara: "♑", Kumbha: "♒", Meena: "♓"
};

const lagnaMeanings = {
  Mesha: "Dynamic, pioneering, and action-oriented",
  Vrishabha: "Stable, grounded, and values-driven",
  Mithuna: "Curious, communicative, and adaptable",
  Karka: "Emotional, nurturing, and intuitive",
  Simha: "Confident, expressive, and natural leaders",
  Kanya: "Analytical, detail-oriented, and practical",
  Tula: "Diplomatic, harmonious, and relationship-focused",
  Vrischika: "Intense, transformative, and strategic",
  Dhanu: "Philosophical, adventurous, and freedom-loving",
  Makara: "Disciplined, ambitious, and structured",
  Kumbha: "Innovative, independent, and futuristic thinking",
  Meena: "Compassionate, imaginative, and spiritually inclined"
};

const rashiInterpretation = {
  Mesha: "energetic, pioneering, slightly impulsive",
  Vrishabha: "stable, grounded, seeking security",
  Mithuna: "communicative, curious, adaptable",
  Karka: "emotional, nurturing, protective",
  Simha: "confident, expressive, seeking recognition",
  Kanya: "analytical, practical, disciplined emotional state",
  Tula: "harmonious, diplomatic, seeking balance",
  Vrischika: "intense, transformative, secretive",
  Dhanu: "optimistic, adventurous, philosophical",
  Makara: "practical, disciplined emotional state, ambitious",
  Kumbha: "innovative, independent, collective-focused",
  Meena: "compassionate, imaginative, sensitive"
};

function generate(plan, results, context) {
  const sections = [];

  for (const step of plan) {
    const { action, isNatal, implicit } = step;

    // ── GET_LAGNA ────────────────────────────────────────────────────────────
    if (action === 'GET_LAGNA') {
      if (implicit) continue; // Issue 7: Hide Lagna spam for implicit checks
      const lagna = results['LAGNA'];
      const type = results['LAGNA_TYPE'] || 'TRANSIT';
      const title = type === 'NATAL' ? '🌅 Your Birth Lagna (Ascendant)' : '🌅 Current Transit Lagna';
      
      if (lagna) {
        const nakName = typeof lagna.nakshatra === 'object' ? (lagna.nakshatra?.name || 'N/A') : lagna.nakshatra;
        const ruler = lagna.ruler || lagna.nakshatra?.lord || lagna.nakshatra?.ruler || "Unknown";
        const symbol = zodiacMap[lagna.name] || '♈';
        const meaning = lagnaMeanings[lagna.name] || 'A time of significant energy and alignment.';

        sections.push(
          `### ${title}\n\n` +
          `${type === 'NATAL' ? 'Your Sidereal Ascendant' : 'The current Ascendant'} is **${lagna.name}** ${symbol} at **${lagna.degree.toFixed(2)}°**.\n\n` +
          `It falls in **${nakName}** Nakshatra, ruled by *${ruler}*.\n\n` +
          `**Meaning:** ${meaning}`
        );
      }
    }

    // ── GET_PANCHANG ─────────────────────────────────────────────────────────
    else if (action === 'GET_PANCHANG') {
      const p = results['PANCHANG'] || context.rawPanchang || context.panchang;
      if (p) {
        let text = `### 📅 Panchang\n\n`;
        text += `**Tithi:** ${p.tithi?.name || p.tithi || 'N/A'}\n`;
        text += `**Vara:** ${p.vara || 'N/A'}\n`;
        text += `**Nakshatra:** ${p.moonNakshatra?.name || p.nakshatra?.name || p.moonNakshatra || p.nakshatra || 'N/A'}\n`;
        if (p.yoga) text += `**Yoga:** ${p.yoga?.name || p.yoga || 'N/A'}\n`;
        if (p.karana) text += `**Karana:** ${p.karana?.name || p.karana || 'N/A'}\n`;
        if (p.rahuKaal || p.rahuKaal_time) {
          const rkVal = p.rahuKaal || p.rahuKaal_time;
          const rk = typeof rkVal === 'object' ? `${rkVal.start} - ${rkVal.end}` : rkVal;
          text += `⛔ **Rahu Kaal:** ${rk}\n`;
        }
        sections.push(text);
      }
    }

    // ── FIND_BEST_TIME ───────────────────────────────────────────────────────
    else if (action === 'FIND_BEST_TIME') {
      const times = results['BEST_TIME'];
      if (times && times.length > 0) {
        let text = `### ⏱️ Auspicious Times\n\n`;
        for (const t of times) {
          text += `- **${t.name}:** ${t.time} (${t.quality})\n`;
        }
        sections.push(text);
      }
    }

    // ── GET_NAKSHATRA ────────────────────────────────────────────────────────
    else if (action === 'GET_NAKSHATRA') {
      if (implicit) continue;
      const nak = results['NAKSHATRA'];
      if (nak && nak.name) {
        sections.push(
          `### ✨ Your Janma Nakshatra\n\n` +
          `You were born under the **${nak.name}** star.\n\n` +
          `${nakshatraInterpreter.interpret(nak.name)}`
        );
      }
    }

    // ── GET_TODAY_NAKSHATRA ──────────────────────────────────────────────────
    else if (action === 'GET_TODAY_NAKSHATRA') {
      if (implicit) continue;
      const nak = results['TODAY_NAKSHATRA'];
      if (nak && nak.name) {
        sections.push(
          `### 🌙 Today's Active Nakshatra\n\n` +
          `The Moon is currently transiting **${nak.name}**.\n\n` +
          `${nakshatraInterpreter.interpret(nak.name)}`
        );
      }
    }

    // ── COMPARE_NAKSHATRA ────────────────────────────────────────────────────
    else if (action === 'COMPARE_NAKSHATRA') {
      const birthNak = results['NAKSHATRA'];
      const transitNak = results['TODAY_NAKSHATRA'];
      if (birthNak && transitNak && birthNak.name && transitNak.name) {
        const bq = birthNak.quality?.toLowerCase() || 'unique';
        const tq = transitNak.quality?.toLowerCase() || 'unique';
        
        let conflict = `${bq} vs ${tq} energy`;
        let result = "mixed influences throughout the day";
        let advice = "maintain balance and adaptability";
        let score = "moderate day";
        
        // Simple logic for comparison
        if (bq === tq) {
           conflict = "harmonious alignment of similar energies";
           result = "amplified focus and natural momentum";
           advice = "lean into your natural strengths today";
           score = "highly favorable day";
        } else if ((bq.includes('fierce') || bq.includes('sharp')) && tq.includes('stable')) {
           conflict = "intense, emotional drive vs structured, grounded reality";
           result = "unstable focus early, but strong achievements later";
           advice = "avoid impulsive decisions and stick to the plan";
           score = "moderate, requires patience";
        } else if (bq.includes('soft') && tq.includes('fierce')) {
           conflict = "gentle nature vs aggressive transit";
           result = "potential for overwhelm or sudden obstacles";
           advice = "protect your energy and avoid confrontations";
           score = "challenging day";
        } else if (bq.includes('mobile') && tq.includes('fixed')) {
           conflict = "desire for movement vs rigid circumstances";
           result = "frustration with delays, but good for building foundations";
           advice = "channel restless energy into long-term projects";
           score = "mixed day";
        }

        sections.push(
          `### ⚖️ Nakshatra Comparison\n\n` +
          `Your Nakshatra (**${birthNak.name}**): ${bq}\n\n` +
          `Today's Nakshatra (**${transitNak.name}**): ${tq}\n\n` +
          `**Analysis:**\n` +
          `- **Dynamic:** ${conflict}\n` +
          `- **Result:** ${result}\n` +
          `- **Advice:** ${advice}\n\n` +
          `👉 **Overall:** ${score}`
        );
      }
    }

    // ── EVALUATION INTENTS ───────────────────────────────────────────────────
    else if (['EVAL_BUSINESS', 'EVAL_TRAVEL', 'EVAL_GENERAL_DAY'].includes(action)) {
      const data = results[action.replace('EVAL_', '')];
      if (data) {
        const titleMap = {
          'EVAL_BUSINESS': 'Business Evaluation',
          'EVAL_TRAVEL': 'Travel Evaluation',
          'EVAL_GENERAL_DAY': 'Overview'
        };
        const title = titleMap[action];
        const verdictEmoji = data.score >= 7 || data.verdict === 'Favorable' ? '✅' : data.score <= 3 || data.verdict === 'Challenging' ? '⛔' : '⚠️';
        const scoreStr = data.overallScore !== undefined ? data.overallScore : data.score;
        
        // Deduplicate reasons globally across evaluations
        if (!context._seenReasons) context._seenReasons = new Set();
        const filteredReasons = data.reasons.filter(r => {
          let key = r;
          if (r.includes('Rahu Kaal')) key = 'Rahu Kaal';
          else if (r.includes('Abhijit Muhurat')) key = 'Abhijit Muhurat';
          else if (r.includes('Pancha Rahita')) key = 'Pancha Rahita';
          else if (r.includes('Moon in')) key = 'Moon Sign';
          
          if (context._seenReasons.has(key)) return false;
          context._seenReasons.add(key);
          return true;
        });

        const displayReasons = action === 'EVAL_GENERAL_DAY' ? filteredReasons.slice(0, 3) : filteredReasons;
        
        if (displayReasons.length > 0 || action === 'EVAL_GENERAL_DAY') {
          sections.push(`### ${verdictEmoji} ${title}\n\n**Verdict:** ${data.verdict} (Score: ${scoreStr}/10)\n\n${displayReasons.join('\n\n')}`);
        }
      }
    }

    // ── PERSONAL_GREETING ─────────────────────────────────────────────────────
    else if (action === 'PERSONAL_GREETING') {
      sections.push(`### 🙏 Namaste!\n\nI'm doing great, thank you for asking! I am your Vedic Astro Copilot, ready to explore the cosmos with you. How can I help you today?`);
    }

    // ── GET_PLANET_INFO ──────────────────────────────────────────────────────
    else if (action === 'GET_PLANET_INFO') {
      const planets = results['PLANETS'];
      if (planets && planets.planets) {
        let text = `### 🪐 Planetary Positions\n\n`;
        const keyPlanets = planets.planets.filter(pl => ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].some(name => pl.name.includes(name)));
        for (const pl of keyPlanets) {
          const rashiName = pl.rashi?.name || 'Unknown';
          const rashiEng = rashiInterpretation[rashiName] ? ` — ${rashiInterpretation[rashiName]}` : '';
          text += `- **${pl.name}** is in **${rashiName}**${rashiEng}\n`;
        }
        sections.push(text);
      }
    }

    // ── SUMMARY_ENGINE ───────────────────────────────────────────────────────
    else if (action === 'SUMMARY_ENGINE') {
      const p = results['PANCHANG'];
      const m = results['TODAY_MOON'];
      const planets = results['PLANETS'];
      
      let sumText = `### 📅 Astrological Summary\n\n`;
      if (p) {
        sumText += `**Tithi:** ${p.tithi?.name || p.tithi || 'N/A'} | **Star:** ${m?.nakshatra?.name || 'N/A'}\n\n`;
        const rk = p.rahuKaal || p.rahuKaal_time;
        if (rk) {
           const rkStr = typeof rk === 'object' ? `${rk.start || ''} - ${rk.end || ''}` : rk;
           sumText += `⛔ **Rahu Kaal:** ${rkStr}\n`;
        }
      }
      
      if (planets && planets.planets) {
        const sun = planets.planets.find(pl => pl.name.includes('Sun'));
        const moon = planets.planets.find(pl => pl.name.includes('Moon'));
        if (sun || moon) {
           sumText += `\n**Current Positions:**\n`;
           if (sun) {
             const sn = sun.rashi?.name || 'Unknown';
             sumText += `- ☀️ Sun in **${sn}**${rashiInterpretation[sn] ? ` — ${rashiInterpretation[sn]}` : ''}\n`;
           }
           if (moon) {
             const mn = moon.rashi?.name || 'Unknown';
             sumText += `- 🌙 Moon in **${mn}**${rashiInterpretation[mn] ? ` — ${rashiInterpretation[mn]}` : ''}\n`;
           }
        }
      }
      sections.push(sumText);
    }

    // ── UPDATE_PROFILE ───────────────────────────────────────────────────────
    else if (action === 'UPDATE_PROFILE') {
      const updated = context.updatedFields || [];
      if (updated.length > 0) {
        let text = `### ✅ Birth Details Saved\n\nI have updated your context with the provided birth details (**${updated.join(', ')}**). \n\n`;
        if (!context.hasBirthDetails) {
          text += `To provide precise readings, I still need your: **${['Date', 'Time', 'Place'].filter(f => !updated.includes(f.toLowerCase())).join(', ')}**.`;
        } else {
          text += `Your profile is complete! You can now ask about your Lagna, Nakshatra, or daily Muhurat.`;
        }
        sections.push(text);
      } else if (!context.hasBirthDetails) {
        sections.push(`### 👤 Birth Profile\n\nPlease provide DOB like: 12 Aug 2004 10:30 Hyderabad`);
      } else {
        const p = context.userProfile;
        sections.push(`### 👤 Your Profile\n\nYou are currently set as born on **${p.dob}**${p.time ? ` at **${p.time}**` : ''}${p.city ? ` in **${p.city}**` : ''}. Tell me if you want to change it.`);
      }
    }
    
    // ── CHAT_STATUS ───────────────────────────────────────────────────────────
    else if (action === 'CHAT_STATUS') {
      const p = context.userProfile || {};
      let text = `### 🌌 Conversation Status\n\n`;
      if (p.dob) {
        text += `We are currently discussing astrological insights for a profile born on **${p.dob}**.\n\n`;
      } else {
        text += `We are in a general consultation. No birth profile is currently active.\n\n`;
      }
      sections.push(text);
    }

    // ── SELF_QUERY ────────────────────────────────────────────────────────────
    else if (action === 'SELF_QUERY') {
      const p = context.userProfile || {};
      const bp = results['BIRTH_PANCHANG'] || {};
      const nakName = (typeof bp.nakshatra === 'object' ? bp.nakshatra?.name : bp.nakshatra) || p.nakshatra || null;
      const rashiName = (typeof bp.rashi === 'object' ? bp.rashi?.name : bp.rashi) || p.rashi || null;
      const lagnaData = results['_NATAL_LAGNA'] || results['LAGNA'];
      const lagnaName = lagnaData?.name || null;

      if (p.dob) {
        let text = `### 🌅 Your Birth Profile\n\n`;
        text += `| Detail | Value |\n|--------|-------|\n`;
        text += `| **Date of Birth** | ${p.dob} |\n`;
        if (p.time) text += `| **Time of Birth** | ${p.time} |\n`;
        if (p.city) text += `| **Place of Birth** | ${p.city} |\n`;
        if (lagnaName) text += `| **Lagna (Ascendant)** | ${zodiacMap[lagnaName] || ''} ${lagnaName} |\n`;
        if (nakName) text += `| **Janma Nakshatra** | ✨ ${nakName} |\n`;
        if (rashiName) text += `| **Rashi (Moon Sign)** | ${zodiacMap[rashiName] || ''} ${rashiName} |\n`;
        if (context.hasBirthDetails) {
          text += `\n*Your profile is complete. Ask me about your Lagna, Nakshatra, or daily Muhurat!*`;
        } else {
          text += `\n⚠️ *Profile incomplete \u2014 please also share your ${!p.time ? 'time of birth ' : ''}${!p.city ? 'and place of birth' : ''}.*`;
        }
        sections.push(text);
      } else {
        sections.push(`### 👤 Birth Profile Required\n\nI don't have your birth details yet. Please share your date, time, and place of birth.\n\n*Example: "I was born on 12 Aug 2004 at 10:30 AM in Hyderabad"*`);
      }
    }

    // ── GET_BIRTH_CHART ──────────────────────────────────────────────────────
    else if (action === 'GET_BIRTH_CHART') {
      const p = context.userProfile || {};
      const planets = results['_NATAL_PLANETS'];
      const lagnaData = results['_NATAL_LAGNA'] || results['LAGNA'];
      const dasha = results['DASHA'];
      const dCharts = results['D_CHARTS'] || {};
      const doshas = results['DOSHAS'] || {};
      
      const { PLANET_HOUSE_MEANINGS, D_CHART_MEANINGS, DOSHA_REMEDIES } = require('../../ai_astrologer/astrology/astrologyDictionary');

      if (!context.hasBirthDetails) {
        sections.push(`### 🔮 Birth Chart\n\nTo compute your Vedic Kundli, I need your complete birth details.\n\n*Example: "I was born on 12 Aug 2004 at 10:30 AM in Hyderabad"*`);
      } else {
        let text = `👋 **Hi! Let’s explore your Vedic chart—“Tell me about me” edition**\n\n`;
        text += `Based on your *Vedic (Parāśari) Kundli*, here is your deterministic deep analysis:\n\n`;

        const lagnaRashiIdx = lagnaData?.rashiIndex ?? 0;
        
        // 1. Quick Kundli Snapshot (D-1)
        if (planets && planets.planets) {
          text += `#### 📌 Quick Kundli Snapshot (D-1 / Rāśi)\n\n`;
          text += `| Category | Your placement | What it generally brings |\n|---|---|---|\n`;
          
          const keyPlanets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
          for (const name of keyPlanets) {
            const pl = planets.planets.find(pl2 => pl2.name.includes(name));
            if (pl) {
              const rn = pl.rashi?.name || 'N/A';
              const sym = zodiacMap[rn] || '';
              const house = pl.rashi ? ((pl.rashi.index - lagnaRashiIdx + 12) % 12) + 1 : '?';
              
              let category = 'Planet';
              if (name === 'Sun') category = 'Key career/soul marker';
              if (name === 'Moon') category = 'Mind & Emotions';
              if (name === 'Mars') category = 'Energy / drive';
              if (name === 'Mercury') category = 'Communication / learning';
              if (name === 'Jupiter') category = 'Wisdom & Expansion';
              if (name === 'Venus') category = 'Wealth & relationships';
              if (name === 'Saturn') category = 'Focus & discipline';
              if (name === 'Rahu' || name === 'Ketu') category = 'Karmic axis';
              
              let meaning = PLANET_HOUSE_MEANINGS[name] && PLANET_HOUSE_MEANINGS[name][house] 
                  ? PLANET_HOUSE_MEANINGS[name][house] 
                  : `Impacts the ${house}th house affairs.`;
                  
              text += `| *${category}* | **${name}** in **${rn}** (${house}th) | ${meaning} |\n`;
            }
          }
          text += '\n';
        }

        // 2. Divisional Charts
        if (Object.keys(dCharts).length > 0) {
          text += `#### 📈 Divisional Charts (D9/D10 highlights — your "fruits")\n\n`;
          text += `Divisional charts show *how results actually manifest* beyond the raw D-1 placement.\n\n`;
          
          const ascCharts = dCharts['Lagna'];
          if (ascCharts) {
            const d9Sign = ascCharts['D9']?.name;
            const d10Sign = ascCharts['D10']?.name;
            
            if (d9Sign && D_CHART_MEANINGS['D9'][d9Sign]) {
                text += `🔹 **D9 (Navāṁśa):** ${D_CHART_MEANINGS['D9'][d9Sign]}\n\n`;
            } else if (d9Sign) {
                text += `🔹 **D9 (Navāṁśa):** Ascendant is ${d9Sign}, coloring your marriage and soul path.\n\n`;
            }
            
            if (d10Sign && D_CHART_MEANINGS['D10'][d10Sign]) {
                text += `🔹 **D10 (Daśāṁśa):** ${D_CHART_MEANINGS['D10'][d10Sign]}\n\n`;
            } else if (d10Sign) {
                text += `🔹 **D10 (Daśāṁśa):** Ascendant is ${d10Sign}, defining your career environment.\n\n`;
            }
            
            text += `🔹 **D2 (Hora):** ${D_CHART_MEANINGS['D2']['good']}\n\n`;
            text += `🔹 **D16 (Shodashamsha):** ${D_CHART_MEANINGS['D16']['mixed']}\n\n`;
          }
        }

        // 3. Current Life Timing (Dasha)
        if (dasha && dasha.current) {
          text += `#### ⏳ Your current life timing: ${dasha.current.lord} Maha-Dasha\n\n`;
          text += `Your *major period* is: **${dasha.current.lord}** (${dasha.current.start} → ${dasha.current.end}).\n\n`;
          text += `| Level | Period |\n|---|---|\n`;
          text += `| *Maha-Dasha* | **${dasha.current.lord}** |\n`;
          if (dasha.antarDasha) text += `| *Antar-Dasha* (now) | **${dasha.antarDasha.lord}** |\n`;
          if (dasha.pratyantarDasha) text += `| *Pratyantar* (now) | **${dasha.pratyantarDasha.lord}** |\n`;
          text += '\n';
        }

        // 4. Doshas and Remedies
        if (doshas && Object.keys(doshas).length > 0) {
            let doshaText = `#### ⚠️ Doshas & Karmic Alignments\n\n`;
            let hasDosha = false;
            
            if (doshas.sadeSati?.isActive) {
                hasDosha = true;
                doshaText += `> [!WARNING]\n> **Sade Sati Active:** ${doshas.sadeSati.phase}\n> ${doshas.sadeSati.description}\n\n`;
                doshaText += `**Remedies:**\n` + DOSHA_REMEDIES['Sade Sati'].map(r => `- ${r}`).join('\n') + '\n\n';
            }
            if (doshas.mangalDosha?.isActive) {
                hasDosha = true;
                doshaText += `> [!IMPORTANT]\n> **Mangal (Kuja) Dosha Active**\n> ${doshas.mangalDosha.description}\n\n`;
                doshaText += `**Remedies:**\n` + DOSHA_REMEDIES['Mangal Dosha'].map(r => `- ${r}`).join('\n') + '\n\n';
            }
            if (doshas.kalaSarpa?.isActive) {
                hasDosha = true;
                doshaText += `> [!CAUTION]\n> **Kala Sarpa Dosha Active:** ${doshas.kalaSarpa.type}\n> ${doshas.kalaSarpa.description}\n\n`;
                doshaText += `**Remedies:**\n` + DOSHA_REMEDIES['Kala Sarpa Dosha'].map(r => `- ${r}`).join('\n') + '\n\n';
            }
            if (doshas.kemdruma?.isActive) {
                hasDosha = true;
                doshaText += `> [!WARNING]\n> **Kemdruma Dosha Active**\n> ${doshas.kemdruma.description}\n\n`;
                doshaText += `**Remedies:**\n` + DOSHA_REMEDIES['Kemdruma Dosha'].map(r => `- ${r}`).join('\n') + '\n\n';
            }
            
            if (hasDosha) {
                text += doshaText;
            } else {
                text += `#### ✅ Doshas\n*Good news! Your chart is currently free from major afflictions like Sade Sati, Mangal Dosha, or Kala Sarpa Dosha.*\n\n`;
            }
        }

        sections.push(text);
      }
    }

    // ── FUTURE_PREDICTION ─────────────────────────────────────────────────────
    else if (action === 'FUTURE_PREDICTION') {
      sections.push(`### 🔮 Future Insights\n\nFor accurate predictions, I need your full birth details. Please provide your date, time, and place of birth.`);
    }

    // ── GREETING / HELP / FALLBACK ──────────────────────────────────────────
    else if (action === 'GREETING') {
      sections.push(`### 🕉️ Namaste\n\nI am your **Vedic Astro Copilot**. Ask me about your Lagna, Nakshatra, or Muhurat to begin.`);
    }
  }

  // ── Final Deduplication & Ordering ────────────────────────────────────────
  const finalSections = [];
  const seenHeadings = new Set();
  
  const ORDER = [
    'Namaste',
    'Birth Details Saved',
    'Birth Profile Required',
    'Birth Profile',
    'Your Profile',
    'Who are you?',
    'Future Insights',
    'Your Birth Lagna',
    'Current Transit Lagna',
    'Your Janma Nakshatra',
    'Today\'s Active Nakshatra',
    'Nakshatra Comparison',
    'Today\'s Panchang',
    'Auspicious Times Today',
    'Planetary Positions',
    'Business Evaluation',
    'Travel Evaluation',
    'Today\'s Overview',
    'Astrological Summary',
    'Conversation Status'
  ];

  for (const s of sections) {
    const heading = s.split('\n')[0].trim();
    if (!seenHeadings.has(heading)) {
      finalSections.push(s);
      seenHeadings.add(heading);
    }
  }

  // Sort by ORDER matching the text part of the heading
  finalSections.sort((a, b) => {
    const aH = a.split('\n')[0].trim();
    const bH = b.split('\n')[0].trim();
    
    // Find matching order by checking if the heading contains the order string
    const idxA = ORDER.findIndex(o => aH.includes(o));
    const idxB = ORDER.findIndex(o => bH.includes(o));
    
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  if (finalSections.length === 0) {
    return `I'm here to help with your Vedic astrology queries. Try asking "What is my Lagna?" or "Is today good for business?"`;
  }

  return finalSections.join('\n\n---\n\n');
}

module.exports = { generate };
