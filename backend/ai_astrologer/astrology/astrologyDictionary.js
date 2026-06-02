const PLANET_HOUSE_MEANINGS = {
    'Sun': {
        1: 'Strong vitality, leadership qualities, focus on self-development.',
        2: 'Drive for wealth, authoritative speech, focus on family legacy.',
        3: 'Courageous, strong communication, self-made success.',
        4: 'Focus on property, deep inner pride, strong influence from mother.',
        5: 'Creative intelligence, speculative gains, authoritative in romance.',
        6: 'Overcomes competitors, strong immune system, success in service.',
        7: 'Ego conflicts in partnerships, desires a high-status spouse.',
        8: 'Deep transformations, interest in occult, sudden life changes.',
        9: 'Strong belief system, leadership in higher learning, fortunate.',
        10: 'Strong drive for status, visibility, leadership; career identity is important for you.',
        11: 'Gains through powerful networks, achieving large-scale goals.',
        12: 'Spiritual detachment, foreign connections, working behind the scenes.'
    },
    'Moon': {
        1: 'Highly sensitive, adaptable, emotionally driven personality.',
        2: 'Fluctuating wealth, soft speech, deep attachment to family.',
        3: 'Imaginative mind, emotional communication, frequent short trips.',
        4: 'Deeply attached to home/mother, seeks emotional security.',
        5: 'Creative, romantic, emotionally invested in learning/children.',
        6: 'Emotional stress from enemies, healing capacity, service-oriented.',
        7: 'Mind gets serious in relationships; you observe a lot. Needs mental clarity + maturity from partner.',
        8: 'Intense emotional depth, highly intuitive, sudden psychological shifts.',
        9: 'Emotional connection to philosophy, travel, and higher wisdom.',
        10: 'Public career, emotional connection to work, fluctuating status.',
        11: 'Desire to belong to groups, gains through female networks.',
        12: 'Vivid dreams, emotional isolation, spiritual retreat.'
    },
    'Mars': {
        1: 'Dynamic, aggressive, highly independent and competitive.',
        2: 'Strong willpower for money/speech/skills; you act fast—sometimes debates get spicy.',
        3: 'High courage, initiative, strong drive to conquer challenges.',
        4: 'Aggressive energy at home, property gains, inner restlessness.',
        5: 'Passionate in romance, competitive in sports/learning.',
        6: 'Crushes enemies, strong immune system, thrives in conflict.',
        7: 'Passionate but conflict-prone in relationships (Mangal Dosha).',
        8: 'Sudden transformations, interest in secrets, highly intense.',
        9: 'Defends beliefs aggressively, driven towards higher goals.',
        10: 'Extremely driven for career success, commanding leadership.',
        11: 'Ambitious networking, aggressive pursuit of large goals.',
        12: 'Hidden anger, impulsive expenses, active dream state.'
    },
    'Mercury': {
        1: 'Highly intelligent, youthful appearance, quick-witted.',
        2: 'Excellent orator, gains through communication, financial logic.',
        3: 'Skilled with hands, constant mental activity, loves writing.',
        4: 'Intellectualizes emotions, educational focus at home.',
        5: 'Analytical creativity, loves games/puzzles, quick learning.',
        6: 'Detail-oriented, good at analyzing problems, argumentative.',
        7: 'Seeks intellectual stimulation in partnerships, communicative spouse.',
        8: 'Deep research abilities, interest in mysteries/astrology.',
        9: 'Deep thinking, research mindset, interest in strategy/analysis; also intensity in belief system.',
        10: 'Career in communication, tech, or commerce; adaptable professional.',
        11: 'Large diverse network, gains through intellectual pursuits.',
        12: 'Imaginative, overthinking, interested in foreign languages.'
    },
    'Jupiter': {
        1: 'Optimistic, wise, naturally lucky and expansive personality.',
        2: 'Wealth accumulation, truthful speech, traditional family values.',
        3: 'Optimistic communication, philosophical writing, good with siblings.',
        4: 'Large home, inner peace, gains through property/mother.',
        5: 'Highly creative, good karma, success in higher education.',
        6: 'Protection from enemies, success in healing/legal matters.',
        7: 'Wise and expansive partner, blessings in marriage.',
        8: 'Psychological depth, sudden changes, interest in secrets/occult/finance risk-management; strong "rebuild" capacity.',
        9: 'Highly philosophical, guru-like figure, extreme luck and travel.',
        10: 'Respected career, teaching/advisory roles, ethical leadership.',
        11: 'Massive gains, large network of wise friends, fulfilled hopes.',
        12: 'Spiritual liberation, charity, protection in foreign lands.'
    },
    'Venus': {
        1: 'Charming, attractive, seeks harmony and luxury.',
        2: 'Wealth through arts/beauty, sweet speech, loves good food.',
        3: 'Creative hobbies, pleasant communication, artistic skills.',
        4: 'Luxurious home, vehicles, deep inner happiness.',
        5: 'Romantic, artistic intelligence, loves entertainment.',
        6: 'Diplomacy with enemies, loves pets, potential health indulgences.',
        7: 'Seeks beautiful and harmonious partnerships, strong desire for love.',
        8: 'Financial gains through partner, intense/secretive romances.',
        9: 'Loves travel, philosophical about love, artistic higher learning.',
        10: 'Career in arts, beauty, or diplomacy; well-liked at work.',
        11: 'Gains through networks, friends, long-term plans; can be selective with who you let close.',
        12: 'Loves bed comforts, hidden romances, luxury in isolation.'
    },
    'Saturn': {
        1: 'Serious, disciplined, slow to mature, strong sense of duty.',
        2: 'Frugal with money, delayed wealth, serious tone of speech.',
        3: 'Hardworking, disciplined communication, takes calculated risks.',
        4: 'Strict upbringing, delayed property, emotional discipline.',
        5: 'Serious learning/creativity; delays in "love/creative success" but gives durability once you commit.',
        6: 'Endurance over enemies, chronic health issues, hard worker.',
        7: 'Delayed or mature marriage, serious commitment, older partner.',
        8: 'Long life, deep fears, transformation through hard work.',
        9: 'Orthodox beliefs, delayed luck, serious approach to religion.',
        10: 'Slow but steady career rise, heavy responsibilities, authority.',
        11: 'Small but loyal network, delayed but permanent gains.',
        12: 'Isolation, disciplined spirituality, foreign settlements.'
    },
    'Rahu': {
        1: 'Highly intuitive, imaginative, "future-focused" identity; Rahu makes you unconventional & restless until you find your niche.',
        2: 'Unconventional wealth, unique speech, breaks family traditions.',
        3: 'Extreme courage, tech-savvy communication, manipulative skills.',
        4: 'Unusual home environment, desire for massive properties.',
        5: 'Obsessive romance, unconventional creativity, speculative gains.',
        6: 'Crushes enemies through unorthodox means, unusual health issues.',
        7: 'Unconventional partnership situations; sudden shifts in mind/decisions.',
        8: 'Sudden transformations, deep occult interests, hidden wealth.',
        9: 'Unorthodox beliefs, foreign travel, questioning traditions.',
        10: 'Massive ambition, sudden rise in career, foreign/tech industries.',
        11: 'Huge network, sudden gains, fulfilling massive desires.',
        12: 'Foreign lands, vivid dreams, unusual spiritual experiences.'
    },
    'Ketu': {
        1: 'Spiritual, detached personality, hard to understand.',
        2: 'Detached from wealth accumulation, blunt speech.',
        3: 'Detached from siblings, highly intuitive communication.',
        4: 'Detached from home/mother, seeks inner spiritual peace.',
        5: 'Detached from romance, past-life intelligence/mantra knowledge.',
        6: 'Hidden enemies, strange illnesses, spiritual approach to healing.',
        7: 'Detachment/ambiguity in relationships at times—can make you emotionally private. When aligned, you become very loyal.',
        8: 'Extreme occult abilities, deep intuition, sudden mystical events.',
        9: 'Deep spiritual pilgrimages, detached from orthodox religion.',
        10: 'Detached from status, unconventional career path.',
        11: 'Detached from large groups, small network, spiritual goals.',
        12: 'Moksha (Liberation), deep meditation, isolation.'
    }
};

const D_CHART_MEANINGS = {
    'D9': {
        Aries: "A dynamic, passionate approach to marriage. Action-oriented partnerships.",
        Taurus: "A stable, grounded relationship outcome. Values loyalty and security.",
        Gemini: "Communication and friendship are the foundation of your long-term commitments.",
        Cancer: "Deep emotional bonding and nurturing are central to your soul's partnerships.",
        Leo: "A proud, loyal, and somewhat dramatic relationship dynamic.",
        Virgo: "Practicality and service define your long-term bonds. Can be highly analytical.",
        Libra: "You seek ultimate balance, harmony, and aesthetic beauty in partnerships.",
        Scorpio: "Intense, transformative, and highly secretive/private relationship dynamics.",
        Sagittarius: "A philosophical, adventurous, and freedom-loving approach to marriage.",
        Capricorn: "A serious, disciplined, and duty-bound approach to long-term commitments.",
        Aquarius: "Unconventional, friendly, and independent relationship structures.",
        Pisces: "A serious karmic flavor (Saturn-Rahu influence), meaning: relationships improve with discipline, clarity, and commitment—but not always in a 'simple' way." // Custom for Pisces as requested in screenshot
    },
    'D10': {
        Aries: "Career potential is driven by independent leadership, action, and pioneering.",
        Taurus: "Career potential is tied to finance, beauty, and building stable structures.",
        Gemini: "Career potential is tied to communication/intellect + unconventional direction. You're not built for only traditional lanes.",
        Cancer: "Career potential is tied to caregiving, real estate, HR, or emotional intelligence.",
        Leo: "Career potential is tied to management, politics, entertainment, and visibility.",
        Virgo: "Career potential is tied to analysis, healthcare, data, and problem-solving.",
        Libra: "Career potential is tied to diplomacy, law, design, and client relations.",
        Scorpio: "Career potential is tied to research, occult, mining, and crisis management.",
        Sagittarius: "Career potential is tied to teaching, travel, law, and advisory roles.",
        Capricorn: "Career potential is tied to corporate structures, heavy responsibility, and administration.",
        Aquarius: "Career potential is tied to technology, networking, and large-scale humanitarian projects.",
        Pisces: "Career potential is tied to foreign lands, spirituality, arts, and healing."
    },
    'D2': {
        good: "Wealth potential is good—but it works best with planning; energy + wisdom = income via skill and long-run strategy."
    },
    'D16': {
        mixed: "Comforts/romance/pleasures can be 'mixed'—you may like excitement, travel, and new experiences, yet you'll also need stability to feel satisfied."
    }
};

const DOSHA_REMEDIES = {
    'Sade Sati': [
        "Chant the Hanuman Chalisa daily to mitigate Saturn's harshness.",
        "Donate black sesame seeds, mustard oil, or dark clothes on Saturdays.",
        "Practice extreme patience and avoid making impulsive, life-altering decisions.",
        "Light a sesame oil lamp under a Peepal tree on Saturday evenings."
    ],
    'Mangal Dosha': [
        "Chant the Mangal Beej Mantra ('Om Kram Kreem Kroum Sah Bhaumaya Namah') 108 times on Tuesdays.",
        "Donate red lentils (Masoor Dal) or red clothes on Tuesdays.",
        "Ensure your partner is also a Mangalik, or perform a Kumbh Vivah before marriage.",
        "Maintain a calm temperament; channel excess aggression into physical workouts."
    ],
    'Kala Sarpa Dosha': [
        "Chant the Maha Mrityunjaya Mantra daily.",
        "Perform the Kala Sarpa Shanti Pooja at Trimbakeshwar or Kalahasti.",
        "Offer a silver pair of snakes (Naag-Naagin) into a flowing river on a Wednesday.",
        "Worship Lord Shiva daily by offering water or milk on the Shivling."
    ],
    'Kemdruma Dosha': [
        "Keep a square piece of silver with you at all times.",
        "Worship Lord Shiva and Goddess Parvati together.",
        "Never disrespect your mother, and seek her blessings daily.",
        "Fast on Mondays or Purnima (Full Moon) to strengthen the Moon."
    ]
};

module.exports = {
    PLANET_HOUSE_MEANINGS,
    D_CHART_MEANINGS,
    DOSHA_REMEDIES
};
