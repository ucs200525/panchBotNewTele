/**
 * Comprehensive House Significance Data for All 16 Divisional Charts (Shodashvarga)
 * Each varga has different house interpretations based on its specific purpose
 */

const VARGA_HOUSE_SIGNIFICANCE = {
    // D1 - Rasi Chart (Main Birth Chart)
    1: {
        name: "Rasi (D1)",
        purpose: "Overall life, physical body, and general destiny",
        houses: {
            1: { title: "Self & Personality", areas: ["Physical body", "Appearance", "Vitality", "Overall health", "Basic nature"] },
            2: { title: "Wealth & Family", areas: ["Accumulated wealth", "Family", "Speech", "Food habits", "Right eye"] },
            3: { title: "Siblings & Courage", areas: ["Younger siblings", "Courage", "Short journeys", "Skills", "Arms"] },
            4: { title: "Mother & Property", areas: ["Mother", "Property", "Education", "Vehicles", "Home comforts", "Heart"] },
            5: { title: "Children & Intelligence", areas: ["Children", "Intelligence", "Past life merit", "Romance", "Speculation"] },
            6: { title: "Enemies & Disease", areas: ["Enemies", "Diseases", "Debts", "Maternal uncle", "Service", "Competition"] },
            7: { title: "Spouse & Partnership", areas: ["Spouse", "Marriage", "Business partnerships", "Travel abroad", "Death"] },
            8: { title: "Longevity & Mysteries", areas: ["Longevity", "Inheritance", "Occult", "Sudden events", "Chronic diseases"] },
            9: { title: "Fortune & Religion", areas: ["Father", "Guru", "Fortune", "Long journeys", "Higher knowledge", "Dharma"] },
            10: { title: "Career & Status", areas: ["Profession", "Fame", "Honor", "Father", "Authority", "Career success"] },
            11: { title: "Gains & Wishes", areas: ["Income", "Gains", "Elder siblings", "Fulfillment of desires", "Left ear"] },
            12: { title: "Loss & Liberation", areas: ["Expenses", "Foreign lands", "Moksha", "Isolation", "Losses", "Left eye"] }
        }
    },

    // D2 - Hora Chart (Wealth)
    2: {
        name: "Hora (D2)",
        purpose: "Wealth accumulation and financial prosperity",
        houses: {
            1: { title: "Self-Earned Wealth", areas: ["Personal earning capacity", "Financial confidence", "Monetary self-worth"] },
            2: { title: "Family Wealth", areas: ["Inherited wealth", "Family resources", "Accumulated savings", "Bank balance"] },
            3: { title: "Wealth from Skills", areas: ["Money through communication", "Business ventures", "Initiative-based income"] },
            4: { title: "Property Wealth", areas: ["Real estate value", "Land holdings", "Mother's wealth", "Fixed assets"] },
            5: { title: "Speculative Gains", areas: ["Stock market", "Gambling luck", "Creative income", "Children's wealth"] },
            6: { title: "Debt & Competition", areas: ["Loans", "Debts", "Service income", "Competitive earnings"] },
            7: { title: "Partnership Wealth", areas: ["Spouse's income", "Business partnership gains", "Marital assets"] },
            8: { title: "Sudden Wealth", areas: ["Inheritance", "Insurance", "Hidden money", "Partner's resources"] },
            9: { title: "Fortune & Windfall", areas: ["Luck in wealth", "Father's wealth", "Foreign earnings", "Blessings"] },
            10: { title: "Career Income", areas: ["Salary", "Professional earnings", "Social status wealth", "Authority-based income"] },
            11: { title: "Total Gains", areas: ["All income sources", "Profits", "Elder's support", "Maximum wealth potential"] },
            12: { title: "Expenses & Charity", areas: ["Expenditure", "Losses", "Donations", "Foreign investments"] }
        }
    },

    // D3 - Drekkana Chart (Siblings & Courage)
    3: {
        name: "Drekkana (D3)",
        purpose: "Siblings, courage, and mental strength",
        houses: {
            1: { title: "Self-Courage", areas: ["Personal bravery", "Initiative", "Self-confidence", "Physical strength"] },
            2: { title: "Family Support", areas: ["Family's courage", "Vocal strength", "Resource-based confidence"] },
            3: { title: "Siblings", areas: ["Younger brothers/sisters", "Co-borns", "Neighbour relations", "Short journeys", "Communication skills"] },
            4: { title: "Inner Strength", areas: ["Emotional courage", "Mental stability", "Inner peace", "Mother's support"] },
            5: { title: "Creative Courage", areas: ["Intellectual bravery", "Children's valor", "Risk-taking ability", "Boldness"] },
            6: { title: "Competitive Spirit", areas: ["Ability to fight", "Overcome enemies", "Disease resistance", "Martial skills"] },
            7: { title: "Partnership Courage", areas: ["Spouse's courage", "Joint ventures", "Courage in relationships"] },
            8: { title: "Hidden Strength", areas: ["Secret courage", "Occult power", "Transformation ability", "Deep resilience"] },
            9: { title: "Righteous Courage", areas: ["Dharmic strength", "Father's courage", "Higher principles", "Long journey boldness"] },
            10: { title: "Professional Bravery", areas: ["Career courage", "Leadership", "Authority", "Public confidence"] },
            11: { title: "Aspirational Strength", areas: ["Courage to achieve goals", "Elder's support", "Network strength"] },
            12: { title: "Spiritual Courage", areas: ["Courage in isolation", "Foreign courage", "Moksha path strength", "Letting go"] }
        }
    },

    // D4 - Chaturthamsa Chart (Property & Fixed Assets)
    4: {
        name: "Chaturthamsa (D4)",
        purpose: "Property, real estate, and fixed assets",
        houses: {
            1: { title: "Self-Owned Property", areas: ["Personal property", "Self-acquired assets", "Land in own name"] },
            2: { title: "Ancestral Property", areas: ["Inherited land", "Family estates", "Parental property share"] },
            3: { title: "Adjacent Properties", areas: ["Neighbouring lands", "Small plots", "Sibling property deals"] },
            4: { title: "Main Property", areas: ["Primary residence", "Mother's property", "Home comforts", "Main estate", "Vehicles"] },
            5: { title: "Creative Assets", areas: ["Property through children", "Speculative land deals", "Intellectual property"] },
            6: { title: "Disputed Property", areas: ["Litigation-prone assets", "Service quarters", "Mortgaged property"] },
            7: { title: "Partnership Property", areas: ["Joint property with spouse", "Business premises", "Shared assets"] },
            8: { title: "Inherited Estate", areas: ["Legacy property", "Sudden land gains", "Hidden assets", "Burial grounds"] },
            9: { title: "Foreign Property", areas: ["Overseas real estate", "Father's property", "Religious land", "Distant properties"] },
            10: { title: "Commercial Property", areas: ["Office spaces", "Career-related assets", "Public land", "Authority buildings"] },
            11: { title: "Total Property Gains", areas: ["All property acquisitions", "Maximum land holdings", "Elder's property"] },
            12: { title: "Property Loss", areas: ["Land losses", "Expenses on property", "Foreign real estate", "Isolation property"] }
        }
    },

    // D7 - Saptamsa Chart (Children & Progeny)
    7: {
        name: "Saptamsa (D7)",
        purpose: "Children, progeny, and grandchildren",
        houses: {
            1: { title: "Fertility & Parenthood", areas: ["Personal fertility", "Ability to conceive", "Parenting capacity"] },
            2: { title: "Family Lineage", areas: ["Family support for children", "Resources for children", "Continuation of family line"] },
            3: { title: "Younger Children", areas: ["Younger children's nature", "Sibling-like children", "Communication with children"] },
            4: { title: "Children's Happiness", areas: ["Home environment for children", "Mother-child bond", "Children's education"] },
            5: { title: "First Child", areas: ["MAIN HOUSE - First child", "Intelligence of children", "Children's creativity", "Romantic children", "Number of children"] },
            6: { title: "Adoption & Issues", areas: ["Childlessness concerns", "Adopted children", "Children's health", "Difficulties"] },
            7: { title: "Spouse's Children", areas: ["Step-children", "Partner's fertility", "Joint progeny decisions"] },
            8: { title: "Obstacles to Children", areas: ["Delays in conception", "Miscarriage risks", "Hidden child issues", "Transformation through parenthood"] },
            9: { title: "Grandchildren", areas: ["Grandchildren quality", "Children's fortune", "Religious children", "Higher values in progeny"] },
            10: { title: "Children's Career", areas: ["Children's profession", "Children's status", "Fame through children"] },
            11: { title: "Fulfillment through Children", areas: ["Joy from children", "Children's gains", "Maximum progeny success"] },
            12: { title: "Loss of Children", areas: ["Child loss", "Foreign children", "Separation from children", "Spiritual children"] }
        }
    },

    // D9 - Navamsa Chart (Marriage, Dharma & Inner Strength)
    9: {
        name: "Navamsa (D9)",
        purpose: "Marriage, spouse, dharma, and inner soul's strength",
        houses: {
            1: { title: "Inner Self", areas: ["Post-marriage personality", "Spiritual self", "Inner strength", "True nature", "Soul development"] },
            2: { title: "Marital Wealth", areas: ["Wealth after marriage", "Joint family", "Value system", "Speech to spouse"] },
            3: { title: "Marital Communication", areas: ["Communication with spouse", "Courage in marriage", "Spouse's siblings"] },
            4: { title: "Marital Happiness", areas: ["Happiness in marriage", "Emotional peace", "Home after marriage", "Heart connection"] },
            5: { title: "Children in Marriage", areas: ["Progeny after marriage", "Romance in marriage", "Dharmic intelligence"] },
            6: { title: "Marriage Obstacles", areas: ["Marital conflicts", "Health in marriage", "Service to spouse", "Divorce indicators"] },
            7: { title: "Spouse & Partnership", areas: ["MAIN HOUSE - Spouse's nature", "Marriage quality", "Life partner", "Business after marriage", "Passion"] },
            8: { title: "Marital Transformation", areas: ["Depth of marriage", "Intimacy", "Spouse's family", "Joint assets", "Occult knowledge"] },
            9: { title: "Dharma & Fortune", areas: ["Spiritual path", "Luck after marriage", "Father-in-law", "Higher wisdom", "Bhagya"] },
            10: { title: "Career in Marriage", areas: ["Professional life post-marriage", "Spouse's career", "Social status together"] },
            11: { title: "Marital Gains", areas: ["Benefits from marriage", "Fulfillment", "Social circle", "Income after marriage"] },
            12: { title: "Marital Moksha", areas: ["Spiritual liberation", "Losses in marriage", "Foreign spouse", "Bed pleasures", "Spiritual union"] }
        }
    },

    // D10 - Dasamsa Chart (Career & Profession)
    10: {
        name: "Dasamsa (D10)",
        purpose: "Career, profession, and worldly achievements",
        houses: {
            1: { title: "Professional Identity", areas: ["Career personality", "Work ethic", "Professional reputation", "Work vitality"] },
            2: { title: "Career Income", areas: ["Salary", "Professional earnings", "Value in workplace", "Speaking skills at work"] },
            3: { title: "Work Communication", areas: ["Workplace communication", "Skills application", "Short business trips", "Colleagues"] },
            4: { title: "Work Comfort", areas: ["Office environment", "Job satisfaction", "Career stability", "Emotional peace at work"] },
            5: { title: "Creative Work", areas: ["Creative professions", "Intelligence at work", "Speculation in career", "Children's career"] },
            6: { title: "Service & Competition", areas: ["Service jobs", "Workplace competition", "Job-related health", "Subordinates", "Daily work routine"] },
            7: { title: "Business Partnerships", areas: ["Business partners", "Client relationships", "Contracts", "Foreign business"] },
            8: { title: "Career Changes", areas: ["Job changes", "Sudden career shifts", "Inheritance in profession", "Deep research work"] },
            9: { title: "Career Fortune", areas: ["Luck in profession", "Higher education for career", "Long business travel", "Ethics at work"] },
            10: { title: "Main Career", areas: ["PRIMARY HOUSE - Main profession", "Fame", "Authority", "Leadership", "Success level", "Father's influence"] },
            11: { title: "Professional Gains", areas: ["Maximum career income", "Promotions", "Recognition", "Network benefits", "Achievement of career goals"] },
            12: { title: "Career Losses", areas: ["Job losses", "Foreign employment", "Behind-scenes work", "Expenses on career", "Retirement"] }
        }
    },

    // D12 - Dwadasamsa Chart (Parents & Ancestors)
    12: {
        name: "Dwadasamsa (D12)",
        purpose: "Parents, ancestors, and lineage",
        houses: {
            1: { title: "Self-Lineage", areas: ["Connection to ancestors", "Personal heredity", "Ancestral traits in self"] },
            2: { title: "Family Heritage", areas: ["Ancestral wealth", "Family traditions", "Parental resources", "Inherited values"] },
            3: { title: "Parental Communication", areas: ["Communication with parents", "Siblings' parents", "Parental siblings"] },
            4: { title: "Mother", areas: ["MOTHER - Mother's health", "Maternal happiness", "Mother's property", "Maternal lineage", "Emotional bond with mother"] },
            5: { title: "Children's Ancestry", areas: ["Children through parents", "Ancestral blessings on children", "Parental guidance"] },
            6: { title: "Parental Health", areas: ["Parents' diseases", "Service to parents", "Mother's enemies", "Health concerns"] },
            7: { title: "Both Parents", areas: ["Parents' relationship", "Partnership between parents", "Parents' business"] },
            8: { title: "Ancestral Karma", areas: ["Inherited karma", "Ancestral curses/blessings", "Parents' longevity", "Hidden family secrets"] },
            9: { title: "Father & Grandfather", areas: ["FATHER - Father's nature", "Paternal grandfather", "Paternal lineage", "Father's fortune", "Father's wisdom"] },
            10: { title: "Parental Status", areas: ["Parents' career", "Family reputation", "Parents' authority", "Social standing of family"] },
            11: { title: "Parental Gains", areas: ["Benefits from parents", "Elder relatives", "Parents' income", "Ancestral blessings"] },
            12: { title: "Parental Loss", areas: ["Loss of parents", "Parents' expenses", "Foreign parents", "Separation from parents"] }
        }
    },

    // D16 - Shodasamsa Chart (Vehicles & Comforts)
    16: {
        name: "Shodasamsa (D16)",
        purpose: "Vehicles, conveyances, and material comforts",
        houses: {
            1: { title: "Personal Vehicle", areas: ["Own vehicle", "Driving ability", "Travel comfort", "Personal mobility"] },
            2: { title: "Family Vehicles", areas: ["Family cars", "Inherited vehicles", "Resources for vehicles", "Vehicle value"] },
            3: { title: "Short Travel", areas: ["Local commute", "Short trips", "Bikes/scooters", "Daily travel", "Communication vehicles"] },
            4: { title: "Main Vehicles", areas: ["PRIMARY HOUSE - Major vehicles", "Cars", "Home comforts", "Vehicle collection", "Luxuries", "Mother's vehicle"] },
            5: { title: "Luxury Vehicles", areas: ["Sports cars", "Speculative vehicle purchase", "Children's vehicles", "Creative comforts"] },
            6: { title: "Service Vehicles", areas: ["Work vehicles", "Company cars", "Vehicle problems", "Maintenance issues", "Accidents"] },
            7: { title: "Partnership Vehicles", areas: ["Spouse's vehicle", "Joint vehicle purchase", "Shared transportation"] },
            8: { title: "Sudden Vehicle Gains", areas: ["Inherited vehicles", "Sudden vehicle acquisition", "Insurance claims", "Vehicle transformation"] },
            9: { title: "Long-Distance Travel", areas: ["Travel vehicles", "Foreign vehicles", "Father's vehicle", "Long journey comforts", "Airplane/ship"] },
            10: { title: "Status Vehicles", areas: ["Luxury cars for status", "Official vehicles", "Professional transportation", "Authority vehicles"] },
            11: { title: "Maximum Vehicles", areas: ["Total vehicle gains", "Multiple vehicles", "High-end comforts", "Elder's vehicles", "All amenities"] },
            12: { title: "Vehicle Loss", areas: ["Vehicle theft/loss", "Foreign vehicles", "Expenses on vehicles", "Import vehicles"] }
        }
    },

    // D20 - Vimsamsa Chart (Spiritual Progress)
    20: {
        name: "Vimsamsa (D20)",
        purpose: "Spiritual development and religious inclinations",
        houses: {
            1: { title: "Spiritual Self", areas: ["Spiritual identity", "Religious nature", "Devotion level", "Sadhana capacity"] },
            2: { title: "Spiritual Resources", areas: ["Religious family", "Mantra power", "Spiritual knowledge accumulation", "Sacred speech"] },
            3: { title: "Spiritual Communication", areas: ["Spreading dharma", "Religious siblings", "Pilgrimage", "Spiritual skills"] },
            4: { title: "Inner Peace", areas: ["Meditative peace", "Mother's spirituality", "Sacred home", "Devotional comfort"] },
            5: { title: "Devotional Intelligence", areas: ["Mantra siddhi", "Devotional practices", "Spiritual children", "Ishta devata", "Religious merit"] },
            6: { title: "Spiritual Discipline", areas: ["Daily worship", "Overcoming spiritual obstacles", "Tantra/healing", "Service to guru"] },
            7: { title: "Guru & Deity", areas: ["Relationship with guru", "Ishta devata", "Divine partnerships", "Spiritual spouse"] },
            8: { title: "Occult & Mysticism", areas: ["Mystical experiences", "Kundalini", "Occult knowledge", "Transformation through spirituality", "Secret practices"] },
            9: { title: "Dharma & Wisdom", areas: ["PRIMARY HOUSE - Religious devotion", "Higher knowledge", "Spiritual guru", "Bhakti", "Pilgrimage", "Father's religion"] },
            10: { title: "Spiritual Authority", areas: ["Religious leadership", "Spiritual career", "Dharmic duty", "Public worship"] },
            11: { title: "Spiritual Gains", areas: ["Blessings", "Spiritual fulfillment", "Moksha progress", "Divine grace", "Religious community"] },
            12: { title: "Moksha", areas: ["Liberation", "Foreign spirituality", "Meditation", "Isolation for God", "Final liberation", "Expenses on dharma"] }
        }
    },

    // D24 - Chaturvimsamsa Chart (Education & Learning)
    24: {
        name: "Chaturvimsamsa (D24)",
        purpose: "Education, learning, and knowledge acquisition",
        houses: {
            1: { title: "Learning Ability", areas: ["Personal intelligence", "Learning capacity", "Student nature", "Educational vitality"] },
            2: { title: "Educational Resources", areas: ["Family support for education", "Educational wealth", "Libraries", "Study materials"] },
            3: { title: "Communication Skills", areas: ["Writing ability", "Speaking skills", "Siblings' education", "Short courses", "Media studies"] },
            4: { title: "Early Education", areas: ["School education", "Mother's education", "Home learning", "Emotional learning", "Primary education"] },
            5: { title: "Higher Intelligence", areas: ["PRIMARY HOUSE - Higher education", "Creative learning", "Speculation knowledge", "Intelligence level", "Academic merit", "Romance with learning"] },
            6: { title: "Technical Education", areas: ["Professional courses", "Service training", "Medical education", "Competition exams", "Skill development"] },
            7: { title: "Partnership Learning", areas: ["Learning from spouse", "Joint studies", "Collaborative learning", "Foreign education"] },
            8: { title: "Research & Occult", areas: ["Deep research", "Occult studies", "Hidden knowledge", "PhD", "Mystical learning", "Transformation through knowledge"] },
            9: { title: "Advanced Learning", areas: ["University education", "Philosophy", "Law studies", "Religious education", "Father's education", "Guru's teaching"] },
            10: { title: "Professional Education", areas: ["Career-related degrees", "MBA", "Certifications", "Professional training", "Recognition for knowledge"] },
            11: { title: "Educational Success", areas: ["Degrees obtained", "Maximum learning", "Academic achievements", "Scholarships", "Knowledge gains"] },
            12: { title: "Foreign Education", areas: ["Overseas studies", "Distance learning", "Spiritual education", "Losses in education", "Research abroad"] }
        }
    },

    // D27 - Saptavimsamsa Chart (Strengths & Weaknesses)
    27: {
        name: "Saptavimsamsa (D27)",
        purpose: "Overall strengths, weaknesses, and vitality",
        houses: {
            1: { title: "Physical Strength", areas: ["PRIMARY HOUSE - Vitality", "Stamina", "Physical power", "Energy level", "Constitution", "Overall strength"] },
            2: { title: "Resource Strength", areas: ["Financial strength", "Family support strength", "Material power", "Vocal strength"] },
            3: { title: "Mental Strength", areas: ["Courage", "Willpower", "Communication strength", "Sibling support", "Initiative power"] },
            4: { title: "Emotional Strength", areas: ["Emotional stability", "Mental peace", "Inner strength", "Maternal support strength"] },
            5: { title: "Intellectual Strength", areas: ["Intelligence power", "Creativity strength", "Merit", "Discriminative ability"] },
            6: { title: "Competitive Strength", areas: ["Ability to overcome", "Disease resistance", "Enemy-defeating power", "Service capacity"] },
            7: { title: "Relationship Strength", areas: ["Partnership power", "Spouse support", "Diplomatic strength", "Marital energy"] },
            8: { title: "Hidden Strength", areas: ["Occult power", "Secret strength", "Regenerative ability", "Transformation power", "Resilience"] },
            9: { title: "Spiritual Strength", areas: ["Dharmic power", "Fortune strength", "Higher knowledge", "Father's support strength"] },
            10: { title: "Professional Strength", areas: ["Career power", "Authority", "Leadership ability", "Status strength", "Work capacity"] },
            11: { title: "Aspirational Strength", areas: ["Power to achieve goals", "Network strength", "Maximum potential", "Gains ability"] },
            12: { title: "Weaknesses", areas: ["Areas of weakness", "Energy drains", "Losses", "Foreign challenges", "Liberation needs"] }
        }
    },

    // D30 - Trimsamsa Chart (Evil, Misfortune & Character)
    30: {
        name: "Trimsamsa (D30)",
        purpose: "Misfortunes, obstacles, and evil influences",
        houses: {
            1: { title: "Personal Afflictions", areas: ["PRIMARY HOUSE - Self-created troubles", "Character flaws", "Personal evils", "Bad habits", "Weaknesses"] },
            2: { title: "Family Misfortunes", areas: ["Family troubles", "Wealth losses", "Speech problems", "Resource depletion"] },
            3: { title: "Sibling Troubles", areas: ["Conflicts with siblings", "Communication problems", "Failed initiatives", "Accidents in travel"] },
            4: { title: "Domestic Problems", areas: ["Home troubles", "Mother's suffering", "Property disputes", "Mental anguish", "Emotional disturbances"] },
            5: { title: "Children's Troubles", areas: ["Problems with children", "Loss of merit", "Failed speculation", "Romance troubles", "Bad decisions"] },
            6: { title: "Enemies & Disease", areas: ["Main enemies", "Chronic diseases", "Debts", "Legal troubles", "Service problems", "Litigation"] },
            7: { title: "Marital Problems", areas: ["Spouse troubles", "Divorce indicators", "Partnership failures", "Relationship conflicts"] },
            8: { title: "Death & Danger", areas: ["Death indicators", "Accidents", "Chronic ailments", "Hidden enemies", "Sudden misfortunes", "Occult attacks"] },
            9: { title: "Fortune Loss", areas: ["Bad luck", "Father's troubles", "Religious conflicts", "Failed journeys", "Loss of grace"] },
            10: { title: "Career Failures", areas: ["Job losses", "Professional disgrace", "Authority conflicts", "Fall from status", "Public shame"] },
            11: { title: "Failed Goals", areas: ["Unfulfilled desires", "Income losses", "Network troubles", "Elder's problems"] },
            12: { title: "Maximum Suffering", areas: ["Major losses", "Hospitalization", "Imprisonment", "Foreign troubles", "Isolation", "Moksha obstacles"] }
        }
    },

    // D40 - Khavedamsa Chart (Auspicious & Inauspicious Effects)
    40: {
        name: "Khavedamsa (D40)",
        purpose: "Maternal legacy and auspicious/inauspicious results",
        houses: {
            1: { title: "Personal Auspiciousness", areas: ["Self-generated good fortune", "Personal karmic effects", "Auspicious nature"] },
            2: { title: "Family Fortune", areas: ["Family blessings", "Inherited auspiciousness", "Material fortune"] },
            3: { title: "Skill-Based Fortune", areas: ["Communication luck", "Initiative results", "Sibling fortune"] },
            4: { title: "Maternal Legacy", areas: ["PRIMARY HOUSE - Mother's lineage effects", "Maternal blessings", "Property from mother", "Home auspiciousness", "Emotional fortune"] },
            5: { title: "Creative Fortune", areas: ["Children's auspiciousness", "Intelligence blessings", "Speculative luck", "Romantic fortune"] },
            6: { title: "Service Results", areas: ["Work karma", "Health effects", "Enemy situations", "Service fortune"] },
            7: { title: "Partnership Fortune", areas: ["Marital auspiciousness", "Business luck", "Spouse's effects", "relationship karma"] },
            8: { title: "Hidden Fortune", areas: ["Secret blessings", "Inheritance luck", "Transformation results", "Occult effects"] },
            9: { title: "Dharmic Fortune", areas: ["Religious merit", "Father's blessings", "Higher grace", "Pilgrimage effects"] },
            10: { title: "Career Fortune", areas: ["Professional auspiciousness", "Authority blessings", "Status effects", "Work results"] },
            11: { title: "Maximum Fortune", areas: ["Total auspicious results", "All gains", "Elder blessings", "Wish fulfillment"] },
            12: { title: "Karmic Cleanup", areas: ["Expense results", "Foreign effects", "Moksha influences", "Liberation karma"] }
        }
    },

    // D45 - Akshavedamsa Chart (General Well-being)
    45: {
        name: "Akshavedamsa (D45)",
        purpose: "General character, conduct, and overall attributes",
        houses: {
            1: { title: "Overall Character", areas: ["PRIMARY HOUSE - General nature", "Personality traits", "Moral character", "Behavioral pattern", "Life conduct"] },
            2: { title: "Value System", areas: ["Moral values", "Family ethics", "Resource management", "Speech quality"] },
            3: { title: "Communication Ethics", areas: ["Truthfulness", "Sibling relations quality", "Initiative morality", "Skillful conduct"] },
            4: { title: "Emotional Character", areas: ["Heart quality", "Maternal influence on character", "Home behavior", "Inner morality"] },
            5: { title: "Intellectual Character", areas: ["Wisdom quality", "Creative ethics", "Children upbringing", "Romantic morality"] },
            6: { title: "Work Ethics", areas: ["Service quality", "Health consciousness", "Competitive integrity", "Daily discipline"] },
            7: { title: "Relationship Character", areas: ["Marital conduct", "Partnership ethics", "Spouse treatment", "Business integrity"] },
            8: { title: "Hidden Character", areas: ["Secret nature", "Depth of character", "Transformation ethics", "Occult morality"] },
            9: { title: "Dharmic Character", areas: ["Religious conduct", "Philosophical nature", "Ethical standards", "Father's influence", "Higher principles"] },
            10: { title: "Professional Character", areas: ["Career ethics", "Leadership quality", "Authority use", "Public conduct"] },
            11: { title: "Social Character", areas: ["Network conduct", "Goal integrity", "Achievement ethics", "Community behavior"] },
            12: { title: "Spiritual Character", areas: ["Moksha readiness", "Liberation conduct", "Foreign behavior", "Isolation ethics"] }
        }
    },

    // D60 - Shashtiamsa Chart (Past Life Karma & Detailed Destiny)
    60: {
        name: "Shashtiamsa (D60)",
        purpose: "Past life karma, detailed destiny, and karmic debts - MOST IMPORTANT",
        houses: {
            1: { title: "Soul's Karma", areas: ["PRIMARY HOUSE - Past life identity", "Karmic body", "Soul's journey", "Deep-rooted nature", "Prarabdha karma", "Life purpose"] },
            2: { title: "Karmic Wealth", areas: ["Past life wealth karma", "Family karma", "Resource karma", "Speech karma from past"] },
            3: { title: "Karmic Courage", areas: ["Past life bravery", "Sibling karma", "Communication karma", "Initiative from past lives"] },
            4: { title: "Emotional Karma", areas: ["Mother's past life connection", "Home karma", "Property from past", "Heart karma", "Ancestral debts"] },
            5: { title: "Intellectual Karma", areas: ["Intelligence from past", "Children karma", "Creative debts", "Romantic karma", "Past merit results"] },
            6: { title: "Service Karma", areas: ["Disease karma", "Enemy karma from past", "Debt karma", "Service obligations", "Health debts"] },
            7: { title: "Relationship Karma", areas: ["Spouse from past life", "Marriage karma", "Partnership debts", "Soul mate connections", "Karmic relationships"] },
            8: { title: "Death Karma", areas: ["Past life death", "Longevity karma", "Occult karma", "Hidden debts", "Transformation patterns", "Rebirth causes"] },
            9: { title: "Dharmic Karma", areas: ["Religious karma", "Father's past connection", "Guru karma", "Higher knowledge debts", "Fortune from past"] },
            10: { title: "Career Karma", areas: ["Professional karma", "Authority from past", "Status karma", "Leadership debts", "Father karma"] },
            11: { title: "Fulfillment Karma", areas: ["Desire karma", "Gain debts", "Elder karma", "Network from past", "Achievement patterns"] },
            12: { title: "Moksha Karma", areas: ["Liberation readiness", "Expense karma", "Foreign karma", "Isolation from past", "Final karma cleanup", "Spiritual debts"] }
        }
    }
};

module.exports = { VARGA_HOUSE_SIGNIFICANCE };
