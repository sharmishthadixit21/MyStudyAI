/**
 * AuraSpace Ambient Soundscapes Procedural Synthesizer Engine
 * Built with native Web Audio API for 100% offline, zero-latency, lag-free audio generation.
 * Features 15+ curated ambient study environments and binaural brainwave entrainments.
 */

class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.activeNodes = {};
    this.currentPreset = null;
    this.isPlaying = false;
    this.volume = parseFloat(localStorage.getItem('aura_ambient_volume')) || 0.7;
    this.isMuted = localStorage.getItem('aura_ambient_muted') === 'true';
    this.intervals = [];
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      const initialGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(initialGain, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, parseFloat(val)));
    localStorage.setItem('aura_ambient_volume', this.volume);
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  mute() {
    this.isMuted = true;
    localStorage.setItem('aura_ambient_muted', 'true');
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return true;
  }

  unmute() {
    this.isMuted = false;
    localStorage.setItem('aura_ambient_muted', 'false');
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    return false;
  }

  toggleMute() {
    return this.isMuted ? this.unmute() : this.mute();
  }

  stopAll() {
    // Clear all interval loops
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];

    // Stop and disconnect all active nodes cleanly
    Object.keys(this.activeNodes).forEach(key => {
      try {
        const node = this.activeNodes[key];
        if (node) {
          if (node.gain && this.ctx) {
            try {
              node.gain.gain.cancelScheduledValues(this.ctx.currentTime);
              node.gain.gain.setValueAtTime(0, this.ctx.currentTime);
            } catch(e){}
          }
          if (node.sources && Array.isArray(node.sources)) {
            node.sources.forEach(s => {
              try {
                if (typeof s.stop === 'function') s.stop(0);
                s.disconnect();
              } catch(e){}
            });
          }
          if (node.gain) {
            try { node.gain.disconnect(); } catch(e){}
          }
        }
      } catch (e) {
        console.warn("Error stopping audio node:", e);
      }
    });

    this.activeNodes = {};
    this.isPlaying = false;
    this.currentPreset = null;
  }

  stop() {
    this.stopAll();
    this.isPlaying = false;
    this.currentPreset = null;
    localStorage.removeItem('aura_last_ambient_preset');
  }

  togglePreset(presetId) {
    if (this.isPlaying && this.currentPreset === presetId) {
      this.stop();
      return false;
    } else {
      this.playPreset(presetId);
      return true;
    }
  }

  playPreset(presetId) {
    if (!presetId || presetId === 'none' || presetId === 'stop') {
      this.stop();
      return;
    }

    this.initContext();
    this.stopAll();

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }

    this.currentPreset = presetId;
    this.isPlaying = true;

    switch (presetId) {
      case 'space': this._createSpaceAmbience(); break;
      case 'rain': this._createRainSound(); break;
      case 'thunder': this._createThunderstorm(); break;
      case 'cafe': this._createCafeAmbience(); break;
      case 'library': this._createLibraryAmbience(); break;
      case 'waves': this._createOceanWaves(); break;
      case 'forest': this._createForestBreeze(); break;
      case 'fire': this._createFireplace(); break;
      case 'pink_noise': this._createPinkNoise(); break;
      case 'brown_noise': this._createBrownNoise(); break;
      case 'white_noise': this._createWhiteNoise(); break;
      case 'binaural': this._createBinauralBeats(); break;
      case 'gamma': this._createGammaWaves(); break;
      case 'clock': this._createClockTicking(); break;
      case 'wind': this._createAutumnWind(); break;
      default: this._createRainSound(); break;
    }

    localStorage.setItem('aura_last_ambient_preset', presetId);
  }

  /* 🌌 1. Deep Space Cosmic Drone */
  _createSpaceAmbience() {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(67.41, this.ctx.currentTime); // 2Hz binaural beating

    const osc3 = this.ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(130.81, this.ctx.currentTime); // C3 overtone

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, this.ctx.currentTime);
    filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.connect(filter); osc2.connect(filter); osc3.connect(filter);
    filter.connect(gain); gain.connect(this.masterGain);

    osc1.start(); osc2.start(); osc3.start(); lfo.start();
    this.activeNodes['space'] = { gain, sources: [osc1, osc2, osc3, lfo] };
  }

  /* 🌧️ 2. Soft Rain & Drizzle (Light soothing rain patter on glass) */
  _createRainSound() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const rainNoise = this.ctx.createBufferSource();
    rainNoise.buffer = noiseBuffer;
    rainNoise.loop = true;

    // Gentle bandpass filter tailored for crisp, soft drizzle
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1250, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.85, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    rainNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    rainNoise.start();
    this.activeNodes['rain'] = { gain, sources: [rainNoise] };

    // Delicate randomized water drop pings
    const dropletInterval = setInterval(() => {
      if (!this.isPlaying || this.currentPreset !== 'rain' || this.isMuted) return;
      try {
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const dropFreq = 1400 + Math.random() * 900;
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(dropFreq, this.ctx.currentTime);
        dropOsc.frequency.exponentialRampToValueAtTime(dropFreq * 0.35, this.ctx.currentTime + 0.05);

        dropGain.gain.setValueAtTime(0.018, this.ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

        dropOsc.connect(dropGain);
        dropGain.connect(gain);

        dropOsc.start();
        dropOsc.stop(this.ctx.currentTime + 0.06);
      } catch(e){}
    }, 450);

    this.intervals.push(dropletInterval);
  }

  /* ⛈️ 3. Thunderstorm & Heavy Rain (Heavy downpour with deep rolling sub-bass thunder) */
  _createThunderstorm() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const heavyBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const heavyData = heavyBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      heavyData[i] = (Math.random() * 2 - 1) * 0.32;
    }

    const heavyNoise = this.ctx.createBufferSource();
    heavyNoise.buffer = heavyBuffer;
    heavyNoise.loop = true;

    // Heavy rain lowpass rumble filter
    const heavyFilter = this.ctx.createBiquadFilter();
    heavyFilter.type = 'lowpass';
    heavyFilter.frequency.setValueAtTime(680, this.ctx.currentTime);
    heavyFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.42, this.ctx.currentTime);

    heavyNoise.connect(heavyFilter);
    heavyFilter.connect(gain);
    gain.connect(this.masterGain);

    heavyNoise.start();
    this.activeNodes['thunder'] = { gain, sources: [heavyNoise] };

    // Periodic dramatic sub-thunder strike & reverberating rolling rumble
    const triggerThunderStrike = () => {
      if (!this.isPlaying || this.currentPreset !== 'thunder' || this.isMuted) return;
      try {
        // 1. Deep Sub-Bass Rumble Oscillator (45Hz - 65Hz)
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(55 + Math.random() * 15, this.ctx.currentTime);
        subOsc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 2.5);

        subGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        subGain.gain.linearRampToValueAtTime(0.38, this.ctx.currentTime + 0.15);
        subGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.8);

        subOsc.connect(subGain);
        subGain.connect(gain);
        subOsc.start();
        subOsc.stop(this.ctx.currentTime + 2.9);

        // 2. Rolling Thunder Noise Crackle
        const tBufSize = Math.floor(this.ctx.sampleRate * 2.2);
        const tBuf = this.ctx.createBuffer(1, tBufSize, this.ctx.sampleRate);
        const tData = tBuf.getChannelData(0);
        for (let i = 0; i < tBufSize; i++) {
          tData[i] = (Math.random() * 2 - 1) * (1 - i / tBufSize);
        }

        const tNoise = this.ctx.createBufferSource();
        tNoise.buffer = tBuf;

        const tFilter = this.ctx.createBiquadFilter();
        tFilter.type = 'lowpass';
        tFilter.frequency.setValueAtTime(160, this.ctx.currentTime);
        tFilter.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 2.0);

        const tGain = this.ctx.createGain();
        tGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        tGain.gain.linearRampToValueAtTime(0.28, this.ctx.currentTime + 0.1);
        tGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.2);

        tNoise.connect(tFilter);
        tFilter.connect(tGain);
        tGain.connect(gain);

        tNoise.start();
        tNoise.stop(this.ctx.currentTime + 2.3);
      } catch(e){}
    };

    // Trigger initial thunder shortly after starting
    setTimeout(triggerThunderStrike, 1500);

    const thunderInterval = setInterval(() => {
      triggerThunderStrike();
    }, 6000);

    this.intervals.push(thunderInterval);
  }

  /* ☕ 4. Kyoto Rain Cafe (Cozy indoor study cafe: muffled rain outside window + warm cafe ambiance + cup clinks + espresso steam) */
  _createCafeAmbience() {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.38, this.ctx.currentTime);
    gain.connect(this.masterGain);

    const sources = [];

    // 1. Muffled outside rain through window (Warm lowpass filtered noise)
    const rainBufSize = 2 * this.ctx.sampleRate;
    const rainBuf = this.ctx.createBuffer(1, rainBufSize, this.ctx.sampleRate);
    const rainData = rainBuf.getChannelData(0);
    for (let i = 0; i < rainBufSize; i++) rainData[i] = (Math.random() * 2 - 1) * 0.16;

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainBuf;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(420, this.ctx.currentTime); // Muffled indoor sound
    rainFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.24, this.ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(gain);
    rainSource.start();
    sources.push(rainSource);

    // 2. Warm cafe indoor room tone / gentle murmuring acoustics (Low subtle resonance)
    const cafeTone = this.ctx.createOscillator();
    cafeTone.type = 'sine';
    cafeTone.frequency.setValueAtTime(62, this.ctx.currentTime); // Low soothing room presence
    const cafeToneGain = this.ctx.createGain();
    cafeToneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    cafeTone.connect(cafeToneGain);
    cafeToneGain.connect(gain);
    cafeTone.start();
    sources.push(cafeTone);

    // Store active node so stopAll() terminates everything immediately
    this.activeNodes['cafe'] = { gain, sources };

    // 3. Realistic ceramic coffee cup clink and espresso machine textures
    const cafeFXInterval = setInterval(() => {
      if (!this.isPlaying || this.currentPreset !== 'cafe' || this.isMuted) return;
      try {
        if (Math.random() > 0.4) {
          // Ceramic cup & saucer clink (Dual harmonic bell pings)
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const fxGain = this.ctx.createGain();

          const baseFreq = 2300 + Math.random() * 400;
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(baseFreq * 1.48, this.ctx.currentTime);

          fxGain.gain.setValueAtTime(0.022, this.ctx.currentTime);
          fxGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);

          osc1.connect(fxGain);
          osc2.connect(fxGain);
          fxGain.connect(gain);

          osc1.start(); osc2.start();
          osc1.stop(this.ctx.currentTime + 0.32);
          osc2.stop(this.ctx.currentTime + 0.32);
        } else {
          // Soft espresso steam release hiss
          const steamBufSize = Math.floor(this.ctx.sampleRate * 0.6);
          const steamBuf = this.ctx.createBuffer(1, steamBufSize, this.ctx.sampleRate);
          const sData = steamBuf.getChannelData(0);
          for (let i = 0; i < steamBufSize; i++) sData[i] = (Math.random() * 2 - 1) * 0.08;

          const sSource = this.ctx.createBufferSource();
          sSource.buffer = steamBuf;

          const sFilter = this.ctx.createBiquadFilter();
          sFilter.type = 'bandpass';
          sFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
          sFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

          const sGain = this.ctx.createGain();
          sGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          sGain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.15);
          sGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.55);

          sSource.connect(sFilter);
          sFilter.connect(sGain);
          sGain.connect(gain);

          sSource.start();
          sSource.stop(this.ctx.currentTime + 0.6);
        }
      } catch(e){}
    }, 3200);

    this.intervals.push(cafeFXInterval);
  }

  /* 🏛️ 5. Oxford Midnight Library */
  _createLibraryAmbience() {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low room resonance A1

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();

    this.activeNodes['library'] = { gain, sources: [osc] };

    // Gentle ticking clock inside library
    const clockInterval = setInterval(() => {
      if (!this.isPlaying || this.currentPreset !== 'library' || this.isMuted) return;
      try {
        const tick = this.ctx.createOscillator();
        const tGain = this.ctx.createGain();
        tick.type = 'triangle';
        tick.frequency.setValueAtTime(900, this.ctx.currentTime);
        tick.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.03);

        tGain.gain.setValueAtTime(0.025, this.ctx.currentTime);
        tGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

        tick.connect(tGain);
        tGain.connect(gain);
        tick.start();
        tick.stop(this.ctx.currentTime + 0.04);
      } catch(e){}
    }, 1000);

    this.intervals.push(clockInterval);
  }

  /* 🌊 6. Gentle Ocean Waves */
  _createOceanWaves() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.2;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    const waveLFO = this.ctx.createOscillator();
    waveLFO.frequency.setValueAtTime(0.12, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(280, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    waveLFO.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);

    noise.start(); waveLFO.start();
    this.activeNodes['waves'] = { gain: waveGain, sources: [noise, waveLFO] };
  }

  /* 🌲 7. Forest Nature & Birds */
  _createForestBreeze() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.15;

    const windNoise = this.ctx.createBufferSource();
    windNoise.buffer = noiseBuffer;
    windNoise.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    windNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);

    windNoise.start();
    this.activeNodes['forest'] = { gain: windGain, sources: [windNoise] };

    const birdInterval = setInterval(() => {
      if (!this.isPlaying || this.currentPreset !== 'forest' || this.isMuted) return;
      if (Math.random() > 0.45) return;
      try {
        const osc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        const baseFreq = 2400 + Math.random() * 1200;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(baseFreq + 600, this.ctx.currentTime + 0.08);
        osc.frequency.linearRampToValueAtTime(baseFreq - 200, this.ctx.currentTime + 0.15);

        bGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
        bGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.18);

        osc.connect(bGain);
        bGain.connect(windGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      } catch(e){}
    }, 2800);

    this.intervals.push(birdInterval);
  }

  /* 🔥 8. Cozy Fireplace & Campfire */
  _createFireplace() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.2;

    const fireNoise = this.ctx.createBufferSource();
    fireNoise.buffer = noiseBuffer;
    fireNoise.loop = true;

    const fireFilter = this.ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

    const fireGain = this.ctx.createGain();
    fireGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    fireNoise.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireGain.connect(this.masterGain);

    fireNoise.start();
    this.activeNodes['fire'] = { gain: fireGain, sources: [fireNoise] };

    const crackleInterval = setInterval(() => {
      if (!this.isPlaying || this.currentPreset !== 'fire' || this.isMuted) return;
      try {
        const crackle = this.ctx.createBufferSource();
        const cBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.04), this.ctx.sampleRate);
        const cData = cBuf.getChannelData(0);
        for(let i=0; i<cData.length; i++) cData[i] = (Math.random() * 2 - 1) * (1 - i/cData.length);
        crackle.buffer = cBuf;

        const cGain = this.ctx.createGain();
        cGain.gain.setValueAtTime(0.04 + Math.random() * 0.06, this.ctx.currentTime);

        crackle.connect(cGain);
        cGain.connect(fireGain);
        crackle.start();
      } catch(e){}
    }, 180);

    this.intervals.push(crackleInterval);
  }

  /* 🎧 9. Pink Noise */
  _createPinkNoise() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const pNoise = this.ctx.createBufferSource();
    pNoise.buffer = noiseBuffer;
    pNoise.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    pNoise.connect(gain);
    gain.connect(this.masterGain);
    pNoise.start();
    this.activeNodes['pink_noise'] = { gain, sources: [pNoise] };
  }

  /* 🌊 10. Deep Brown Noise (1/f² sub rumble for ADHD & deep reading) */
  _createBrownNoise() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const bNoise = this.ctx.createBufferSource();
    bNoise.buffer = noiseBuffer;
    bNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    bNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    bNoise.start();
    this.activeNodes['brown_noise'] = { gain, sources: [bNoise] };
  }

  /* ⚪ 11. White Noise */
  _createWhiteNoise() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.08;

    const wNoise = this.ctx.createBufferSource();
    wNoise.buffer = noiseBuffer;
    wNoise.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    wNoise.connect(gain);
    gain.connect(this.masterGain);
    wNoise.start();
    this.activeNodes['white_noise'] = { gain, sources: [wNoise] };
  }

  /* 🧠 12. 10Hz Alpha Focus Waves */
  _createBinauralBeats() {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(200, this.ctx.currentTime);

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(210, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(gain);
    gain.connect(this.masterGain);

    oscL.start(); oscR.start();
    this.activeNodes['binaural'] = { gain, sources: [oscL, oscR] };
  }

  /* ⚡ 13. 40Hz Gamma Peak Concentration Waves */
  _createGammaWaves() {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(240, this.ctx.currentTime);

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(280, this.ctx.currentTime); // 40Hz binaural difference

    const merger = this.ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(gain);
    gain.connect(this.masterGain);

    oscL.start(); oscR.start();
    this.activeNodes['gamma'] = { gain, sources: [oscL, oscR] };
  }

  /* 🕰️ 14. Vintage Clock Ticking */
  _createClockTicking() {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.connect(this.masterGain);

    const clockInterval = setInterval(() => {
      if (!this.isPlaying || this.currentPreset !== 'clock' || this.isMuted) return;
      try {
        const tick = this.ctx.createOscillator();
        const tGain = this.ctx.createGain();
        tick.type = 'sine';
        tick.frequency.setValueAtTime(1100, this.ctx.currentTime);
        tick.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.04);

        tGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        tGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

        tick.connect(tGain);
        tGain.connect(gain);
        tick.start();
        tick.stop(this.ctx.currentTime + 0.05);
      } catch(e){}
    }, 1000);

    this.intervals.push(clockInterval);
    this.activeNodes['clock'] = { gain, sources: [] };
  }

  /* 🍃 15. Autumn Wind & Rustling Leaves */
  _createAutumnWind() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.18;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(240, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(); lfo.start();
    this.activeNodes['wind'] = { gain, sources: [noise, lfo] };
  }
}

if (typeof window !== 'undefined') {
  window.AmbientAudioEngine = AmbientAudioEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AmbientAudioEngine };
}
