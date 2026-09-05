/**
 * AuraSpace Aesthetic Study Partner & Companion Haven
 * Evolving Study Partners: Baby 🍼 -> Learner 🎒 -> Master 🎓 -> Scholar 👑
 * Includes Free & Premium Aesthetic Partners (Panda, Owl, Fox, Cat, Dragon, Phoenix, Robo, Lion)
 * 100% Focused on Study Consistency & XP (Virtual Coins Removed).
 */

class AuraCompanionEngine {
  constructor() {
    this.storageKey = 'aura_companion_state';
    this.state = this.loadState();
    this.speechTimer = null;
    this.initSpeechCycle();
  }

  loadState() {
    const defaultState = {
      name: 'Athena',
      species: 'owl', // 'owl', 'panda', 'cat', 'fox', 'dog', 'dragon', 'phoenix', 'robo', 'lion'
      level: 1,
      xp: 25,
      xpNeeded: 100,
      vitality: 95,
      mood: 'Focused & Caring 🥰',
      totalFocusMinutes: 0,
      unlockedDecor: ['lofi_lamp'],
      activeDecor: ['lofi_lamp'],
      unlockedAccessories: ['none'],
      equippedAccessory: 'none',
      isFloatingWidgetActive: false,
      isStudyingWithUser: false,
      currentSpeech: "Hey there! Ready to crush today's study goals? Remember to stay hydrated! 💧✨",
      speechCategory: "motivation",
      monthStudyDays: 1
    };

    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey));
      const merged = { ...defaultState, ...(saved || {}) };
      delete merged.coins;
      return merged;
    } catch (e) {
      return defaultState;
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Error saving companion state:", e);
    }
    this.render();
  }

  getRandomSpeech(category = null) {
    const lang = localStorage.getItem('aura_app_language') || 'en';
    const isHindi = lang === 'hi';

    const speechLibrary = {
      water: isHindi ? [
        "💧 पानी पी लो! हाइड्रेशन दिमाग के फोकस और मेमोरी को 14% तक बढ़ाता है।",
        "🚰 वाटर ब्रेक टाइम! एक गिलास ताजा पानी पियो और रिफ्रेश रहो ✨",
        "💧 पानी पीने का समय! अपने दिमाग को हमेशा हाइड्रेटेड रखो।"
      ] : [
        "💧 Drink water! Staying hydrated boosts brain focus and retention by up to 14%.",
        "🚰 Time for a fresh water break! Hydrate your body & mind ✨",
        "💧 Keep your mind energized with fresh water for maximum memory retention!"
      ],
      eye_rest: isHindi ? [
        "👀 आँखों को आराम दो: 20-20-20 नियम! स्क्रीन से दूर 20 फीट दूर किसी वस्तु को 20 सेकंड देखो!",
        "👀 पलकें झपकाओ और आँखों को 10 सेकंड के लिए बंद करके शांति महसूस करो ✨",
        "✨ हथेलियों को आपस में रगड़ कर आँखों पर धीरे से रखें, तुरंत ताजगी मिलेगी।"
      ] : [
        "👀 20-20-20 Rule: Look away 20 feet for 20 seconds to rest your optic nerves!",
        "👀 Blink gently and close your eyes for 10 seconds to rest your vision ✨",
        "✨ Quick eye wellness: Rub your palms together warmly and cup them over your eyes."
      ],
      posture_break: isHindi ? [
        "🧘 रीढ़ सीधी रखो, कंधे तनावमुक्त। सही पोस्चर थकान को आधा कर देता है।",
        "🤸 थोड़ा स्ट्रेच करो! दोनों हाथ ऊपर उठाओ और गहरी सांस लो 🌬️",
        "🍵 2 मिनट का वॉक ब्रेक ले लो, इससे दिमाग में नया रक्त संचार होगा!"
      ] : [
        "🧘 Posture Check! Keep your spine upright and shoulders relaxed.",
        "🤸 Quick Stretch: Reach your hands up high, roll your shoulders, and breathe deep 🌬️",
        "🍵 Take a quick 2-minute stroll to refresh your focus and blood circulation!"
      ],
      motivation: isHindi ? [
        "🔥 Keep going! निरंतरता ही आपकी सबसे बड़ी सुपरपावर है। छोटी प्रगति भी बहुत मायने रखती है।",
        "🚀 आप बहुत अच्छा कर रहे हो! एक समय में एक ही टॉपिक समझो, सब आसान लगने लगेगा।",
        "✨ जो आज ईमानदारी से मेहनत करेगा, कल वही गर्व से सिर उठाकर अपना रिजल्ट देखेगा!",
        "📚 हर 1 घंटे की पढ़ाई आपको आपके लक्ष्य और ड्रीम कॉलेज के एक कदम और करीब ला रही है।"
      ] : [
        "🔥 Keep going! Consistency is your true superpower. Every small step compounds.",
        "🚀 You are capable of mastering difficult concepts. One chapter at a time!",
        "✨ Hard work and self-discipline always lead to mastery. Keep moving forward!",
        "📚 The hours you dedicate today are sculpting your brilliant future tomorrow!"
      ],
      test_confidence: isHindi ? [
        "💪 गलतियों से डरो मत! गलतियाँ ही सिखाती हैं कि कहाँ सुधार करना है।",
        "🎯 स्पीड से ज्यादा सटीकता (Accuracy) जरूरी है। हर सवाल ध्यान से पढ़ो!",
        "🏆 खुद पर अटूट विश्वास रखो! आपकी मेहनत कभी व्यर्थ नहीं जाएगी ✨"
      ] : [
        "💪 Never fear test mistakes! Each identified error is a mark saved on the real exam.",
        "🎯 Focus on accuracy over rush. Read each question carefully and calmly!",
        "🏆 Self-belief + Daily Practice = Guaranteed Success ✨"
      ],
      night: isHindi ? [
        "🌙 रात हो रही है, 7-8 घंटे की गहरी नींद भी दिमाग के लिए उतनी ही जरूरी है!",
        "😴 पढ़ी गई चीजें नींद में ही दिमाग में स्थायी रूप से स्टोर होती हैं। समय पर सो जाओ!"
      ] : [
        "🌙 It's getting late! 7-8 hours of quality sleep is vital for neuroplasticity.",
        "😴 Your brain consolidates and stores memories during deep sleep. Rest on time!"
      ],
      studying: isHindi ? [
        "🎧 शशश... डीप फोकस मोड ऑन! मैं आपके साथ शांति से पढ़ रहा हूँ 📚",
        "⚡ लेजर फोकस एक्टिव! ध्यान सिर्फ किताब पर, 100% एकाग्रता!",
        "📖 आपके साथ पढ़ रहा हूँ... चलिए इस चैप्टर को पूरी तरह मास्टर करते हैं!"
      ] : [
        "🎧 Shhh... Deep Focus Mode ON! Studying silently with you at our desk 📚",
        "⚡ Laser focus active! Zero distractions, 100% mastery!",
        "📖 Studying alongside you... let's conquer this topic together!"
      ],
      eating: isHindi ? [
        "🥰 वाह! बहुत स्वादिष्ट ट्रीट था! एनर्जी 100% रिचार्ज हो गई 💖",
        "✨ ट्रीट के लिए धन्यवाद! अब अगले स्टडी सेशन के लिए पूरी तरह तैयार हैं!"
      ] : [
        "🥰 Delicious treat! Vitality and energy 100% recharged 💖",
        "✨ Thank you for the treat! Now ready for the next deep focus block!"
      ]
    };

    if (category && speechLibrary[category]) {
      const list = speechLibrary[category];
      return list[Math.floor(Math.random() * list.length)];
    }

    const hour = new Date().getHours();
    let pool = [
      ...speechLibrary.water,
      ...speechLibrary.eye_rest,
      ...speechLibrary.posture_break,
      ...speechLibrary.motivation,
      ...speechLibrary.test_confidence
    ];
    if (hour >= 23 || hour <= 4) {
      pool = [...pool, ...speechLibrary.night];
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  triggerSmartSpeech(category = null) {
    this.state.currentSpeech = this.getRandomSpeech(category);
    this.saveState();
  }

  initSpeechCycle() {
    if (this.speechTimer) clearInterval(this.speechTimer);
    this.speechTimer = setInterval(() => {
      if (!this.state.isStudyingWithUser) {
        this.triggerSmartSpeech();
      }
    }, 120000);
  }

  setStudyingState(isStudying) {
    this.state.isStudyingWithUser = isStudying;
    if (isStudying) {
      this.state.mood = 'Laser Focused 🎧';
      this.triggerSmartSpeech('studying');
    } else {
      this.state.mood = 'Proud & Caring 🥰';
      this.triggerSmartSpeech('posture_break');
    }
    this.saveState();
  }

  addXP(amount, reason = "Study Activity") {
    this.state.xp += amount;
    this.state.vitality = Math.min(100, this.state.vitality + Math.floor(amount / 3));
    this.state.mood = 'Proud 🏆';

    // Level up check
    if (this.state.xp >= this.state.xpNeeded) {
      this.state.level += 1;
      this.state.xp = this.state.xp - this.state.xpNeeded;
      this.state.xpNeeded = Math.floor(this.state.xpNeeded * 1.25);
      
      this.checkDecorUnlocks();
      this.checkAccessoryUnlocks();

      if (typeof confetti === 'function') {
        confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 } });
      }
      this.state.currentSpeech = `🎉 Woohoo! We evolved to Level ${this.state.level} (${this.getStageName()})! Super proud of your daily consistency! ✨`;
    }

    this.saveState();
  }

  getStageName() {
    if (this.state.level < 4) return 'Baby Partner 🍼';
    if (this.state.level < 8) return 'Learner Partner 🎒';
    if (this.state.level < 14) return 'Master Partner 🎓';
    return 'Scholar Partner 👑';
  }

  getStageKey() {
    if (this.state.level < 4) return 'baby';
    if (this.state.level < 8) return 'learner';
    if (this.state.level < 14) return 'master';
    return 'scholar';
  }

  checkDecorUnlocks() {
    const decorMap = {
      2: 'vinyl_player',
      3: 'bonsai_pot',
      4: 'starry_window',
      5: 'neon_sign',
      7: 'crystal_orb',
      10: 'golden_trophy'
    };

    if (decorMap[this.state.level] && !this.state.unlockedDecor.includes(decorMap[this.state.level])) {
      this.state.unlockedDecor.push(decorMap[this.state.level]);
      this.state.activeDecor.push(decorMap[this.state.level]);
    }
  }

  checkAccessoryUnlocks() {
    const accUnlockMap = {
      2: 'glasses',
      3: 'cozy_scarf',
      4: 'headphones',
      5: 'sakura',
      7: 'grad_cap',
      9: 'wizard',
      12: 'crown',
      15: 'visor'
    };

    if (!this.state.unlockedAccessories) this.state.unlockedAccessories = ['none'];
    if (accUnlockMap[this.state.level] && !this.state.unlockedAccessories.includes(accUnlockMap[this.state.level])) {
      this.state.unlockedAccessories.push(accUnlockMap[this.state.level]);
    }
  }

  feedTreat(treatId) {
    const lang = localStorage.getItem('aura_app_language') || 'en';
    const isHindi = lang === 'hi';

    const treats = {
      hot_cocoa: { name: isHindi ? 'गरम कोको ☕' : 'Hot Cocoa ☕', vitality: 15, xp: 20 },
      ramen: { name: isHindi ? 'कोजी रामेन 🍜' : 'Cozy Ramen 🍜', vitality: 30, xp: 40 },
      boba: { name: isHindi ? 'बोबा मिल्क टी 🧋' : 'Boba Milk Tea 🧋', vitality: 50, xp: 60 },
      matcha: { name: isHindi ? 'माचा ग्रीन टी 🍵' : 'Zen Matcha Latte 🍵', vitality: 70, xp: 80 },
      magic_cookie: { name: isHindi ? 'गोल्डन कुकी 🍪' : 'Golden Energy Cookie 🍪', vitality: 100, xp: 100 },
      elixir: { name: isHindi ? 'फोकस अमृत 🍯' : 'Mastery Focus Elixir 🍯', vitality: 100, xp: 180 }
    };

    const treat = treats[treatId];
    if (!treat) return;

    this.state.vitality = Math.min(100, this.state.vitality + treat.vitality);
    this.addXP(treat.xp, `Fed ${treat.name}`);
    this.triggerSmartSpeech('eating');

    if (typeof confetti === 'function') {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    alert(isHindi ? `💖 ${this.state.name} को स्वादिष्ट ${treat.name} खिलाया! (+${treat.vitality}% एनर्जी, +${treat.xp} XP)` : `💖 Fed ${this.state.name} delicious ${treat.name}! (+${treat.vitality}% Vitality, +${treat.xp} XP)`);
  }

  equipAccessory(accId) {
    const lang = localStorage.getItem('aura_app_language') || 'en';
    const isHindi = lang === 'hi';
    const reqLevelMap = {
      none: 1, glasses: 2, cozy_scarf: 3, headphones: 4,
      sakura: 5, grad_cap: 7, wizard: 9, crown: 12, visor: 15
    };

    const reqLevel = reqLevelMap[accId] || 1;
    if (this.state.level < reqLevel && !this.state.unlockedAccessories.includes(accId)) {
      alert(isHindi ? `🔒 यह एक्सेसरी लेवल ${reqLevel} पर अनलॉक होगी! (आपका स्तर: लेवल ${this.state.level})` : `🔒 This accessory unlocks at Level ${reqLevel}! (Current Level: ${this.state.level})`);
      return;
    }

    if (!this.state.unlockedAccessories) this.state.unlockedAccessories = ['none'];
    if (!this.state.unlockedAccessories.includes(accId)) {
      this.state.unlockedAccessories.push(accId);
    }
    this.state.equippedAccessory = accId;
    this.saveState();
    alert(isHindi ? `✨ एक्सेसरी सफलतापूर्वक पहन ली गई!` : `✨ Accessory equipped!`);
  }

  setSpecies(speciesKey, isProRequired = false) {
    if (isProRequired && typeof isProActive === 'function' && !isProActive()) {
      alert('👑 This aesthetic study partner is part of AuraSpace Premium! Upgrade to unlock Zen Panda and mythical partners.');
      if (typeof toggleProModal === 'function') toggleProModal(true);
      return;
    }
    this.state.species = speciesKey;
    this.saveState();
  }

  setName(newName) {
    if (!newName || !newName.trim()) return;
    this.state.name = newName.trim();
    this.saveState();
  }

  interact() {
    this.addXP(10, "Affection / Petting");
    const moods = ['Loved 💖', 'Focused 🧘', 'Inspired 🌟', 'Playful 🎈', 'Cozy 🍵', 'Caring 🥰'];
    this.state.mood = moods[Math.floor(Math.random() * moods.length)];
    this.triggerSmartSpeech();
    this.saveState();
  }

  getSpeciesAvatar() {
    const speciesMap = {
      owl: '🦉',
      panda: '🐼',
      cat: '🐱',
      fox: '🦊',
      dog: '🐶',
      dragon: '🐲',
      phoenix: '🦅',
      robo: '🤖',
      lion: '🦁'
    };
    return speciesMap[this.state.species] || '🦉';
  }

  getAccessoryOverlay() {
    const acc = this.state.equippedAccessory;
    if (!acc || acc === 'none') return '';
    const map = {
      glasses: '👓',
      cozy_scarf: '🧣',
      headphones: '🎧',
      sakura: '🌸',
      grad_cap: '🎓',
      wizard: '🧙',
      crown: '👑',
      visor: '🥽'
    };
    return map[acc] || '';
  }

  toggleDecor(decorId) {
    if (!this.state.unlockedDecor.includes(decorId)) return;
    const idx = this.state.activeDecor.indexOf(decorId);
    if (idx > -1) {
      this.state.activeDecor.splice(idx, 1);
    } else {
      this.state.activeDecor.push(decorId);
    }
    this.saveState();
  }

  toggleFloatingWidget() {
    this.state.isFloatingWidgetActive = !this.state.isFloatingWidgetActive;
    this.saveState();
    this.renderFloatingWidget();
  }

  renderFloatingWidget() {
    let widget = document.getElementById('aura-floating-pet');
    if (!this.state.isFloatingWidgetActive) {
      if (widget) widget.style.display = 'none';
      return;
    }

    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'aura-floating-pet';
      widget.style.cssText = `
        position: fixed; bottom: 30px; left: 30px; z-index: 9999;
        background: var(--card-bg); border: 1px solid var(--card-border);
        padding: 10px 18px; border-radius: 40px; backdrop-filter: blur(20px);
        display: flex; align-items: center; gap: 12px; cursor: pointer;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3); transition: all 0.3s ease;
      `;
      widget.onclick = () => {
        if (typeof switchTab === 'function') switchTab('companion');
      };
      document.body.appendChild(widget);
    }

    const acc = this.getAccessoryOverlay();
    const isStudying = this.state.isStudyingWithUser;

    widget.innerHTML = `
      <div style="position:relative;">
        <span style="font-size: 1.9rem; display:inline-block; animation: ${isStudying ? 'bounce 1.5s infinite' : 'float 3s infinite'};">${this.getSpeciesAvatar()}</span>
        ${isStudying ? `<span style="position:absolute; top:-8px; right:-6px; font-size:1.1rem; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">🎧</span>` : (acc ? `<span style="position:absolute; top:-6px; right:-6px; font-size:0.9rem;">${acc}</span>` : '')}
      </div>
      <div style="font-size: 0.82rem;">
        <div style="font-weight:600; color:var(--accent-pastel);">${this.state.name} • Lv.${this.state.level} (${this.getStageName().split(' ')[0]})</div>
        <div style="color:var(--text-muted); font-size:0.75rem;">${isStudying ? '🎧 Studying Together' : this.state.mood}</div>
      </div>
    `;
    widget.style.display = 'flex';
  }

  render() {
    const container = document.getElementById('companion-tab-container');
    if (!container) return;

    const lang = localStorage.getItem('aura_app_language') || 'en';
    const isHindi = lang === 'hi';

    const xpPercent = Math.min(100, Math.round((this.state.xp / this.state.xpNeeded) * 100));
    const accOverlay = this.getAccessoryOverlay();
    const stage = this.getStageKey();
    const isScholar = stage === 'scholar';
    const isMaster = stage === 'master';
    const isStudying = this.state.isStudyingWithUser;

    const allDecors = [
      { id: 'lofi_lamp', name: isHindi ? 'लोफाई लैंप 💡' : 'Lofi Glow Lamp 💡', unlockAt: 1 },
      { id: 'vinyl_player', name: isHindi ? 'विनाइल प्लेयर 🎵' : 'Vinyl Player 🎵', unlockAt: 2 },
      { id: 'bonsai_pot', name: isHindi ? 'ज़ेन बोनसाई 🪴' : 'Zen Bonsai 🪴', unlockAt: 3 },
      { id: 'starry_window', name: isHindi ? 'तारों भरी खिड़की 🌌' : 'Starry Skylight 🌌', unlockAt: 4 },
      { id: 'neon_sign', name: isHindi ? 'नियॉन साइन ⚡' : 'Neon Aura Sign ⚡', unlockAt: 5 },
      { id: 'crystal_orb', name: isHindi ? 'फोकस क्रिस्टल 🔮' : 'Focus Crystal 🔮', unlockAt: 7 },
      { id: 'golden_trophy', name: isHindi ? 'मास्टरी ट्रॉफी 🏆' : 'Mastery Trophy 🏆', unlockAt: 10 }
    ];

    const accessoriesList = [
      { id: 'none', name: isHindi ? 'कोई नहीं' : 'No Accessory', icon: '❌', unlockLv: 1 },
      { id: 'glasses', name: isHindi ? 'स्टडी चश्मा' : 'Study Glasses', icon: '👓', unlockLv: 2 },
      { id: 'cozy_scarf', name: isHindi ? 'कोजी स्कार्फ' : 'Cozy Scarf', icon: '🧣', unlockLv: 3 },
      { id: 'headphones', name: isHindi ? 'नियॉन हेडफ़ोन' : 'Neon Headphones', icon: '🎧', unlockLv: 4 },
      { id: 'sakura', name: isHindi ? 'सकुरा हेयरपिन' : 'Sakura Pin', icon: '🌸', unlockLv: 5 },
      { id: 'grad_cap', name: isHindi ? 'ग्रेजुएशन कैप' : 'Graduation Cap', icon: '🎓', unlockLv: 7 },
      { id: 'wizard', name: isHindi ? 'विजार्ड हैट' : 'Wizard Cap', icon: '🧙', unlockLv: 9 },
      { id: 'crown', name: isHindi ? 'विजेता क्राउन' : 'Winner Crown', icon: '👑', unlockLv: 12 },
      { id: 'visor', name: isHindi ? 'साइबर वाइज़र' : 'Cyber Visor', icon: '🥽', unlockLv: 15 }
    ];

    const speciesList = [
      { key: 'owl', name: isHindi ? 'एथेना उल्लू' : 'Athena Owl', icon: '🦉', desc: isHindi ? 'बुद्धिमान व शांत गाइड' : 'Wisdom & Calm Focus', pro: false },
      { key: 'fox', name: isHindi ? 'सेलेस्टियल फॉक्स' : 'Celestial Fox', icon: '🦊', desc: isHindi ? 'तेज व सजग दिमाग' : 'Agile & Sharp Intellect', pro: false },
      { key: 'cat', name: isHindi ? 'कोजी कैट' : 'Cozy Cat', icon: '🐱', desc: isHindi ? 'शांति व निरंतरता' : 'Serene Daily Focus', pro: false },
      { key: 'dog', name: isHindi ? 'लॉयल पप' : 'Loyal Pup', icon: '🐶', desc: isHindi ? 'उत्साहवर्धक साथी' : 'Enthusiastic Partner', pro: false },
      
      // Premium Tier Study Partners
      { key: 'panda', name: isHindi ? 'ज़ेन मास्टर पांडा 👑' : 'Zen Master Panda 👑', icon: '🐼', desc: isHindi ? 'असीम धैर्य व शांति (Pro)' : 'Infinite Patience & Zen (Pro 👑)', pro: true },
      { key: 'dragon', name: isHindi ? 'स्टार ड्रैगन 👑' : 'Mystic Star Dragon 👑', icon: '🐲', desc: isHindi ? 'दिव्य ऊर्जा व शक्ति (Pro)' : 'Cosmic Power & Will (Pro 👑)', pro: true },
      { key: 'phoenix', name: isHindi ? 'सोलर फीनिक्स 👑' : 'Solar Phoenix 👑', icon: '🦅', desc: isHindi ? 'अनुशासन ज्वाला (Pro)' : 'Unstoppable Flame (Pro 👑)', pro: true },
      { key: 'robo', name: isHindi ? 'साइबर रोबो 👑' : 'Cyber AI Robo 👑', icon: '🤖', desc: isHindi ? 'एआई सटीकता (Pro)' : 'AI Precision Matrix (Pro 👑)', pro: true },
      { key: 'lion', name: isHindi ? 'रॉयल लायन 👑' : 'Royal Golden Lion 👑', icon: '🦁', desc: isHindi ? 'साहस व नेतृत्व (Pro)' : 'Courage & Crown (Pro 👑)', pro: true }
    ];

    container.innerHTML = `
      <!-- Partner Selection Header -->
      <div style="text-align:center; margin-bottom:14px; padding:12px 18px; background:linear-gradient(135deg, rgba(192,132,252,0.14), rgba(244,114,182,0.09)); border:1px solid var(--card-border); border-radius:16px; box-shadow: 0 6px 20px rgba(0,0,0,0.12);">
        <h2 style="font-family:'Playfair Display', serif; font-size:1.5rem; color:var(--accent-pastel); margin-bottom:2px;">
          ${isHindi ? 'AuraSpace एस्थेटिक स्टडी पार्टनर हेवन 🐾' : 'AuraSpace Aesthetic Study Partner Haven 🐾'}
        </h2>
        <p style="color:var(--text-muted); font-size:0.82rem; max-width:680px; margin:0 auto;">
          ${isHindi ? 'अपने पसंदीदा अध्ययन साथी को चुनें! रोज़ाना पढ़ाई और फोकस से आपका पार्टनर <strong>बेबी 🍼</strong> से <strong>लर्नर 🎒</strong>, <strong>मास्टर 🎓</strong> और <strong>विद्वान 👑</strong> में विकसित होगा।' : 'Choose your aesthetic study buddy! Through daily focus and consistency, your partner evolves from <strong>Baby 🍼</strong> to <strong>Learner 🎒</strong>, <strong>Master 🎓</strong>, and finally <strong>Scholar 👑</strong>!'}
        </p>
      </div>

      <div style="display:grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; align-items:start;">
        
        <!-- Interactive Study Room Stage -->
        <div class="section-card" style="text-align:center; position:relative; overflow:hidden; padding:18px; border-top: 4px solid var(--accent-pastel); margin-bottom:0;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
              <div style="display:flex; gap:6px; align-items:center;">
                <span class="tag-badge" style="background:var(--accent-pastel); color:#0f172a; font-weight:700; font-size:0.72rem;">LVL ${this.state.level}</span>
                <span class="tag-badge" style="background:rgba(52,211,153,0.18); color:#34d399; font-weight:700; font-size:0.72rem;">🔥 ${this.state.xp} XP</span>
              </div>
              <span class="tag-badge" style="background:rgba(255,255,255,0.08); font-size:0.78rem; color:var(--accent-pastel);">${this.getStageName()}</span>
            </div>

            <!-- Talking Speech Bubble Coach -->
            <div style="position:relative; margin: 6px auto 10px; max-width: 96%; background: rgba(255,255,255,0.08); border: 1.2px solid var(--accent-pastel); border-radius: 12px; padding: 8px 14px; text-align: left; box-shadow: 0 4px 16px rgba(0,0,0,0.2); cursor: pointer;" onclick="auraCompanion.triggerSmartSpeech()" title="Click for fresh motivation or wellness reminder!">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 2px;">
                <span style="font-size:0.7rem; font-weight:700; color:var(--accent-pastel); text-transform:uppercase; letter-spacing:0.5px;">💬 ${this.state.name} ${isHindi ? 'कहता है:' : 'says:'}</span>
                <span style="font-size:0.68rem; color:var(--text-muted);">${isHindi ? 'नया विचार ↻' : 'Refresh ↻'}</span>
              </div>
              <p style="font-size:0.86rem; line-height:1.35; color:var(--text-main); font-weight:500;">"${this.state.currentSpeech}"</p>
              <div style="position:absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid var(--accent-pastel);"></div>
            </div>
            
            <!-- Virtual Room Stage with Active Decor & Avatar -->
            <div style="margin: 6px 0 10px; position:relative; min-height: 120px; display:flex; flex-direction:column; align-items:center; justify-content:center; background: radial-gradient(circle at center, rgba(192,132,252,0.18) 0%, transparent 72%); border-radius: 16px; padding: 10px 6px;">
              <!-- Background Unlocked Decors -->
              <div style="position:absolute; top: 6px; left: 14px; font-size:1.4rem; opacity:${this.state.activeDecor.includes('starry_window') ? 1 : 0.08};">🌌</div>
              <div style="position:absolute; top: 6px; right: 14px; font-size:1.4rem; opacity:${this.state.activeDecor.includes('neon_sign') ? 1 : 0.08};">⚡</div>
              <div style="position:absolute; bottom: 20px; left: 16px; font-size:1.4rem; opacity:${this.state.activeDecor.includes('lofi_lamp') ? 1 : 0.08};">💡</div>
              <div style="position:absolute; bottom: 20px; right: 16px; font-size:1.4rem; opacity:${this.state.activeDecor.includes('vinyl_player') ? 1 : 0.08};">🎵</div>
              <div style="position:absolute; bottom: 20px; right: 55px; font-size:1.4rem; opacity:${this.state.activeDecor.includes('bonsai_pot') ? 1 : 0.08};">🪴</div>
              <div style="position:absolute; top: 8px; left: 55px; font-size:1.4rem; opacity:${this.state.activeDecor.includes('crystal_orb') ? 1 : 0.08};">🔮</div>
              <div style="position:absolute; top: 8px; right: 55px; font-size:1.4rem; opacity:${this.state.activeDecor.includes('golden_trophy') ? 1 : 0.08};">🏆</div>
              
              <!-- Avatar Container with Evolution Effects -->
              <div style="position:relative; display:inline-block; margin-bottom: 4px;">
                <!-- Scholar Glow Aura -->
                ${isScholar ? `
                  <div style="position:absolute; top:-16px; left:-16px; right:-16px; bottom:-16px; background:radial-gradient(circle, rgba(251,191,36,0.35) 0%, rgba(192,132,252,0.2) 50%, transparent 75%); border-radius:50%; animation: pulse 2.5s infinite ease-in-out;"></div>
                  <span style="position:absolute; top:-16px; left:50%; transform:translateX(-50%); font-size:1.6rem; filter:drop-shadow(0 2px 6px rgba(251,191,36,0.8));">👑</span>
                ` : ''}

                <!-- Master Stage Accessory -->
                ${isMaster && !isScholar ? `
                  <span style="position:absolute; top:-6px; left:-6px; font-size:1.3rem; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">🎓</span>
                  <span style="position:absolute; bottom:-4px; right:-6px; font-size:1.3rem;">📖</span>
                ` : ''}

                <!-- Main Pet Character -->
                <span style="font-size: 4.2rem; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4)); animation: ${isStudying ? 'bounce 1.5s' : 'float 3.5s'} infinite ease-in-out; cursor:pointer; display:inline-block;" onclick="auraCompanion.interact()" title="Click to pet!">
                  ${this.getSpeciesAvatar()}
                </span>
                
                <!-- Equipped Custom Accessory -->
                ${accOverlay && !isScholar ? `<span style="position:absolute; top:0; right:-4px; font-size:1.6rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${accOverlay}</span>` : ''}
                
                <!-- Active Study Headphones Overlay in Study Mode -->
                ${isStudying ? `<span style="position:absolute; top:-8px; left:50%; transform:translateX(-50%); font-size:1.8rem; filter: drop-shadow(0 2px 6px rgba(56,189,248,0.7)); animation: pulse 1.5s infinite;">🎧</span>` : ''}
              </div>

              <!-- Study-Together Desk Animation Stage -->
              ${isStudying ? `
                <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.5); padding: 5px 12px; border-radius: 16px; display: flex; align-items: center; gap: 6px; box-shadow: 0 0 14px rgba(56,189,248,0.25); animation: fadeIn 0.4s ease;">
                  <span style="font-size:1rem;">💡</span>
                  <span style="font-size:0.78rem; font-weight:600; color:#38bdf8;">${isHindi ? 'फोकस डेस्क: आपके साथ पढ़ाई कर रहा हूँ! 🎧' : 'Focus Desk: Studying quietly with you! 🎧'}</span>
                </div>
              ` : `
                <div style="font-size:0.75rem; color:var(--text-muted); display:flex; align-items:center; gap:4px;">
                  <span>${isHindi ? `टैप करें और +10 XP पाएं 💖` : `Tap ${this.state.name} to pet & gain +10 XP 💖`}</span>
                </div>
              `}
            </div>

            <h2 style="font-family:'Playfair Display', serif; font-size:1.45rem; margin-bottom: 2px; color:var(--accent-pastel);">${this.state.name}</h2>
          </div>

          <div>
            <!-- Vitality & Progress Bars -->
            <div style="margin-bottom:8px;">
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:3px;">
                <span>${isHindi ? 'एनर्जी / वाइटैलिटी:' : 'Vitality / Energy:'} <strong style="color:#34d399;">${this.state.vitality}%</strong></span>
                <span>${isHindi ? 'विकास:' : 'Evolution:'} <strong>${this.state.xp}/${this.state.xpNeeded} XP</strong> (${xpPercent}%)</span>
              </div>
              <div class="progress-bar-bg" style="margin-bottom:8px; height:6px;">
                <div class="progress-bar-fill" style="width: ${xpPercent}%;"></div>
              </div>
            </div>

            <!-- Feed Treats Quick Bar -->
            <div style="margin-bottom:10px; padding:10px; background:rgba(0,0,0,0.25); border-radius:12px; border:1px solid var(--card-border);">
              <div style="font-size:0.78rem; font-weight:600; color:var(--text-muted); margin-bottom:6px; display:flex; justify-content:space-between;">
                <span>🍱 ${isHindi ? 'पार्टनर को ट्रीट खिलाएं:' : 'Feed Partner Study Treats:'}</span>
                <span style="color:var(--accent-pastel);">✨ ${isHindi ? 'एनर्जी रिचार्ज' : 'Instant Recharge'}</span>
              </div>
              <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                <button class="btn-primary" style="padding:5px 4px; font-size:0.72rem; background:rgba(255,255,255,0.1);" onclick="auraCompanion.feedTreat('hot_cocoa')" title="+15 Vitality, +20 XP">☕ Cocoa</button>
                <button class="btn-primary" style="padding:5px 4px; font-size:0.72rem; background:rgba(255,255,255,0.1);" onclick="auraCompanion.feedTreat('ramen')" title="+30 Vitality, +40 XP">🍜 Ramen</button>
                <button class="btn-primary" style="padding:5px 4px; font-size:0.72rem; background:rgba(255,255,255,0.1);" onclick="auraCompanion.feedTreat('boba')" title="+50 Vitality, +60 XP">🧋 Boba</button>
                <button class="btn-primary" style="padding:5px 4px; font-size:0.72rem; background:rgba(255,255,255,0.1);" onclick="auraCompanion.feedTreat('matcha')" title="+70 Vitality, +80 XP">🍵 Matcha</button>
                <button class="btn-primary" style="padding:5px 4px; font-size:0.72rem; background:linear-gradient(135deg,#f59e0b,#d97706);" onclick="auraCompanion.feedTreat('magic_cookie')" title="100% Vitality, +100 XP">🍪 Cookie</button>
                <button class="btn-primary" style="padding:5px 4px; font-size:0.72rem; background:linear-gradient(135deg,#ec4899,#8b5cf6);" onclick="auraCompanion.feedTreat('elixir')" title="100% Vitality, +180 XP">🍯 Elixir</button>
              </div>
            </div>

            <div style="display:flex; gap:8px; justify-content:center;">
              <button class="btn-primary" style="padding:7px 16px; font-size:0.8rem;" onclick="auraCompanion.interact()">${isHindi ? 'प्यार करें 💖 (+10 XP)' : 'Pet & Motivate 💖 (+10 XP)'}</button>
              <button class="btn-primary" style="background:rgba(255,255,255,0.15); padding:7px 14px; font-size:0.8rem;" onclick="auraCompanion.toggleFloatingWidget()">
                ${this.state.isFloatingWidgetActive ? (isHindi ? 'पेट छुपाएं' : 'Hide Pet') : (isHindi ? 'डेस्कटॉप पेट 📌' : 'Desktop Pet 📌')}
              </button>
            </div>
          </div>
        </div>

        <!-- Customization, Accessories & Room Decor -->
        <div style="display:flex; flex-direction:column; gap:12px;">
          
          <!-- Rename & Species Selection -->
          <div class="section-card" style="margin-bottom:0; padding:16px;">
            <h3 style="font-family:'Playfair Display', serif; margin-bottom: 8px; font-size:1.1rem; color:var(--accent-pastel);">${isHindi ? 'स्टडी पार्टनर रोस्टर' : 'Study Partner Roster'}</h3>
            
            <div style="margin-bottom: 10px;">
              <div style="display:flex; gap:6px;">
                <input type="text" id="companion-rename-input" value="${this.state.name}" style="flex:1; padding:5px 10px; font-size:0.82rem;">
                <button class="btn-primary" style="padding:5px 12px; font-size:0.78rem;" onclick="auraCompanion.setName(document.getElementById('companion-rename-input').value)">${isHindi ? 'सेव' : 'Save'}</button>
              </div>
            </div>

            <div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; max-height:220px; overflow-y:auto; padding-right:4px;">
                ${speciesList.map(s => `
                  <button class="btn-primary ${this.state.species === s.key ? '' : 'btn-outline'}" 
                          style="padding:6px 8px; font-size:0.75rem; display:flex; align-items:center; gap:6px; justify-content:flex-start; ${s.pro ? 'border-color: rgba(251,191,36,0.5);' : ''}" 
                          onclick="auraCompanion.setSpecies('${s.key}', ${s.pro})">
                    <span style="font-size:1.15rem;">${s.icon}</span>
                    <div style="text-align:left; overflow:hidden;">
                      <div style="font-weight:600; font-size:0.75rem; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${s.name}</div>
                      <div style="font-size:0.65rem; color:${s.pro ? 'var(--gold-accent)' : 'var(--text-muted)'}; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${s.desc}</div>
                    </div>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Level-Based Wearable Accessories Wardrobe -->
          <div class="section-card" style="margin-bottom:0; padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <h4 style="font-size:0.9rem; color:var(--accent-pastel);">${isHindi ? 'वार्डरोब और एक्सेसरीज' : 'Wardrobe & Level Accessories'}</h4>
              <span style="font-size:0.7rem; color:var(--text-muted);">${isHindi ? 'लेवल बढ़ने पर अनलॉक' : 'Unlocks as Level Rises'}</span>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; max-height:160px; overflow-y:auto; padding-right:4px;">
              ${accessoriesList.map(acc => {
                const isUnlocked = this.state.level >= acc.unlockLv || (this.state.unlockedAccessories || []).includes(acc.id);
                const isEquipped = this.state.equippedAccessory === acc.id;
                return `
                  <div style="padding:6px 10px; background:rgba(255,255,255,${isEquipped ? '0.12' : '0.04'}); border:1px solid ${isEquipped ? 'var(--accent-pastel)' : 'var(--card-border)'}; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                      <div style="font-size:0.76rem; font-weight:600;">${acc.icon} ${acc.name}</div>
                      <span style="font-size:0.68rem; color:var(--text-muted);">${isUnlocked ? (isEquipped ? (isHindi ? 'सक्रिय ✨' : 'Equipped ✨') : (isHindi ? 'अनलॉक' : 'Unlocked')) : `Lv.${acc.unlockLv}`}</span>
                    </div>
                    ${isUnlocked ? `
                      <button class="btn-primary" style="padding:2px 6px; font-size:0.68rem; background:${isEquipped ? 'var(--accent-pastel)' : 'rgba(255,255,255,0.1)'}; color:${isEquipped ? '#0f172a' : 'white'};" onclick="auraCompanion.equipAccessory('${acc.id}')">
                        ${isEquipped ? (isHindi ? 'हटाएँ' : 'Active') : (isHindi ? 'पहनें' : 'Equip')}
                      </button>
                    ` : `
                      <span style="font-size:0.75rem; color:var(--text-muted);">🔒</span>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Room Decor & Atmosphere Unlocks -->
          <div class="section-card" style="margin-bottom:0; padding:16px;">
            <h4 style="margin-bottom:8px; font-size:0.9rem; color:var(--accent-pastel);">${isHindi ? 'स्टडी रूम डेकोर व माहौल' : 'Study Room Atmosphere & Decor'}</h4>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; max-height:160px; overflow-y:auto; padding-right:4px;">
              ${allDecors.map(decor => {
                const isUnlocked = this.state.unlockedDecor.includes(decor.id);
                const isActive = this.state.activeDecor.includes(decor.id);
                return `
                  <div style="padding:6px 10px; background:rgba(255,255,255,${isUnlocked ? '0.08' : '0.02'}); border:1px solid ${isActive ? 'var(--accent-pastel)' : 'var(--card-border)'}; border-radius:8px; display:flex; justify-content:space-between; align-items:center; opacity:${isUnlocked ? 1 : 0.45};">
                    <div>
                      <div style="font-size:0.76rem; font-weight:500;">${decor.name}</div>
                      <span style="font-size:0.68rem; color:var(--text-muted);">${isUnlocked ? (isActive ? (isHindi ? 'सक्रिय ✨' : 'Active ✨') : (isHindi ? 'बंद' : 'Off')) : `Lv.${decor.unlockAt}`}</span>
                    </div>
                    ${isUnlocked ? `<button style="background:transparent; border:none; color:var(--accent-pastel); font-size:0.95rem; cursor:pointer;" onclick="auraCompanion.toggleDecor('${decor.id}')">${isActive ? '✅' : '➕'}</button>` : '🔒'}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>

      </div>
    `;

    this.renderFloatingWidget();
  }
}

// Global Singleton & Module Export
if (typeof window !== 'undefined') {
  window.AuraCompanionEngine = AuraCompanionEngine;
  window.auraCompanion = new AuraCompanionEngine();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuraCompanionEngine };
}
