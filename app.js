/**
 * Intura Design Studio — WhatsApp AI Concierge Demo
 * Developed by Axiino Technologies
 * Frontend-only interactive simulation
 */

(function () {
  'use strict';

  // State Management
  const state = {
    step: 0,
    isTyping: false,
    soundEnabled: true,
    viewMode: 'mobile', // 'mobile' | 'desktop'
    enquiry: {
      refId: 'IDS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      propertyType: '',
      location: '',
      sqft: '',
      floorPlanAttached: false,
      floorPlanName: '',
      floorPlanUrl: '',
      requirements: [],
      timestamp: ''
    }
  };

  // DOM Elements
  const messagesContainer = document.getElementById('messages-container');
  const chatScrollArea = document.getElementById('chat-scroll-area');
  const typingIndicator = document.getElementById('typing-indicator-wrap');
  const botStatusIndicator = document.getElementById('bot-status-indicator');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const micIcon = document.getElementById('mic-icon');
  const sendIcon = document.getElementById('send-icon');
  const btnAttachFile = document.getElementById('btn-attach-file');
  const fileInputElement = document.getElementById('file-input-element');
  const btnRestartDemo = document.getElementById('btn-restart-demo');
  const btnToggleView = document.getElementById('btn-toggle-view');
  const viewText = document.getElementById('view-text');
  const viewIcon = document.getElementById('view-icon');
  const appContainer = document.getElementById('app-container');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundLabel = document.getElementById('sound-label');
  const soundIcon = document.getElementById('sound-icon');
  const livePhoneClock = document.getElementById('live-phone-clock');
  const sidebarTime = document.getElementById('sidebar-time');
  const sidebarSnippet = document.getElementById('sidebar-snippet');
  const blueprintModal = document.getElementById('blueprint-modal');
  const modalFloorplanImg = document.getElementById('modal-floorplan-img');
  const modalFloorplanTitle = document.getElementById('modal-floorplan-title');

  // Clock Update
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const timeFormatted = `${hours}:${strMinutes} ${ampm}`;
    const simpleTime = `${hours}:${strMinutes}`;

    if (livePhoneClock) livePhoneClock.textContent = simpleTime;
    if (sidebarTime) sidebarTime.textContent = timeFormatted;
    state.enquiry.timestamp = timeFormatted;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // Audio Synthesizer (Zero external dependencies)
  function playBeep(type) {
    if (!state.soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'send') {
        // Crisp outgoing pop
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'receive') {
        // Cheerful incoming chime
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.setValueAtTime(780, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'success') {
        // High soft chime for completion
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // AudioContext policy or unsupported
    }
  }

  // Audio Toggle Button
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      if (state.soundEnabled) {
        soundLabel.textContent = 'Audio On';
        soundIcon.textContent = '🔊';
        btnSoundToggle.classList.remove('muted');
        playBeep('send');
      } else {
        soundLabel.textContent = 'Audio Muted';
        soundIcon.textContent = '🔇';
        btnSoundToggle.classList.add('muted');
      }
    });
  }

  // View Switcher (Mobile Mockup vs WhatsApp Web)
  if (btnToggleView) {
    btnToggleView.addEventListener('click', () => {
      if (state.viewMode === 'mobile') {
        state.viewMode = 'desktop';
        appContainer.classList.add('desktop-mode');
        viewText.textContent = 'Mobile Device View';
        viewIcon.textContent = '📱';
      } else {
        state.viewMode = 'mobile';
        appContainer.classList.remove('desktop-mode');
        viewText.textContent = 'WhatsApp Web View';
        viewIcon.textContent = '💻';
      }
      scrollToBottom();
    });
  }

  // Restart Button
  if (btnRestartDemo) {
    btnRestartDemo.addEventListener('click', restartConversation);
  }

  // Input Field Event (Switch Mic to Send Arrow)
  if (chatInput) {
    chatInput.addEventListener('input', () => {
      const val = chatInput.value.trim();
      if (val.length > 0) {
        micIcon.style.display = 'none';
        sendIcon.style.display = 'block';
      } else {
        micIcon.style.display = 'block';
        sendIcon.style.display = 'none';
      }
    });
  }

  // Scroll Helper
  function scrollToBottom() {
    setTimeout(() => {
      chatScrollArea.scrollTop = chatScrollArea.scrollHeight;
    }, 50);
  }

  // Helper to get formatted current time
  function getCurrentTimeString() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  }

  // Add User Message to Chat
  function addUserMessage(text) {
    const time = getCurrentTimeString();
    const row = document.createElement('div');
    row.className = 'msg-row outgoing';
    row.innerHTML = `
      <div class="bubble">
        <div class="bubble-text">${escapeHtml(text)}</div>
        <div class="bubble-meta">
          <span>${time}</span>
          <span class="blue-ticks">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
              <path d="M11.05 1.5L4.5 8.05L1.95 5.5" stroke="#53bdeb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14.55 1.5L8 8.05" stroke="#53bdeb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(row);
    scrollToBottom();
    playBeep('send');

    // Update sidebar snippet
    if (sidebarSnippet) {
      sidebarSnippet.textContent = text;
    }
  }

  // Show / Hide Typing Indicator
  function showTyping(show = true) {
    state.isTyping = show;
    if (show) {
      typingIndicator.style.display = 'flex';
      messagesContainer.appendChild(typingIndicator);
      botStatusIndicator.innerHTML = '<span class="typing-active">typing...</span>';
      scrollToBottom();
    } else {
      typingIndicator.style.display = 'none';
      botStatusIndicator.innerHTML = '<span>online</span>';
    }
  }

  // Add Bot Message to Chat
  function addBotMessage(contentHtml, delay = 800) {
    showTyping(true);
    return new Promise(resolve => {
      setTimeout(() => {
        showTyping(false);
        const time = getCurrentTimeString();
        const row = document.createElement('div');
        row.className = 'msg-row incoming';
        row.innerHTML = `
          <div class="bubble">
            ${contentHtml}
            <div class="bubble-meta">
              <span>${time}</span>
            </div>
          </div>
        `;
        messagesContainer.appendChild(row);
        scrollToBottom();
        playBeep('receive');
        resolve(row);
      }, delay);
    });
  }

  // Escape HTML helper
  function escapeHtml(string) {
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }

  // START CONVERSATION / INITIAL WELCOME
  async function startConversation() {
    messagesContainer.innerHTML = '';
    state.step = 0;
    state.enquiry.refId = 'IDS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    state.enquiry.propertyType = '';
    state.enquiry.location = '';
    state.enquiry.sqft = '';
    state.enquiry.floorPlanAttached = false;
    state.enquiry.floorPlanName = '';
    state.enquiry.floorPlanUrl = '';
    state.enquiry.requirements = [];

    // Step 0: Welcome Message with Intura Brand Header
    const welcomeHtml = `
      <div class="brand-intro-box">
        <img src="assets/intura-logo.jpg" alt="Intura Design Studio" class="brand-intro-logo">
        <div class="brand-intro-text">
          <span class="brand-intro-name">Intura Design Studio</span>
          <span class="brand-intro-slogan">Interiors With Aura</span>
          <span class="brand-intro-desc">Bespoke Residential &amp; Architectural Interiors</span>
        </div>
      </div>
      <div class="bubble-text">
        <p>👋 Hello and welcome to <strong>Intura Design Studio</strong>!</p>
        <p>I am <strong>Aura</strong>, your intelligent interior concierge. We specialize in transforming residences into exquisite, timeless living spaces with our turnkey design craftsmanship.</p>
        <p>To help tailor your custom design estimate and connect you with the right principal designer, <strong>what type of property are we designing?</strong></p>
      </div>
      <div class="wa-interactive-card">
        <button type="button" class="wa-action-btn" onclick="selectPropertyType('🏢 Apartment / Flat')">
          <span class="wa-action-icon">🏢</span> Apartment / Flat
        </button>
        <button type="button" class="wa-action-btn" onclick="selectPropertyType('🏡 Luxury Villa')">
          <span class="wa-action-icon">🏡</span> Luxury Villa
        </button>
        <button type="button" class="wa-action-btn" onclick="selectPropertyType('🏠 Independent House')">
          <span class="wa-action-icon">🏠</span> Independent House / Builder Floor
        </button>
        <button type="button" class="wa-action-btn" onclick="selectPropertyType('🏙️ Penthouse / Duplex')">
          <span class="wa-action-icon">🏙️</span> Penthouse / Duplex
        </button>
      </div>
    `;

    await addBotMessage(welcomeHtml, 400);
    state.step = 1;
  }

  // STEP 1: Handle Property Type Choice
  window.selectPropertyType = async function (type) {
    if (state.step !== 1 || state.isTyping) return;
    state.enquiry.propertyType = type;
    addUserMessage(type);

    state.step = 2; // Moving to Location
    const locationPromptHtml = `
      <div class="bubble-text">
        <p>Wonderful! Designing for a <strong>${escapeHtml(type)}</strong> allows us to craft stunning spatial harmony and functional luxury. 🌟</p>
        <p><strong>Where is your property located?</strong> (Select a popular area or type your locality/city below):</p>
      </div>
      <div class="chips-container">
        <button type="button" class="choice-chip" onclick="selectLocation('Whitefield, Bangalore')">📍 Whitefield</button>
        <button type="button" class="choice-chip" onclick="selectLocation('Indiranagar, Bangalore')">📍 Indiranagar</button>
        <button type="button" class="choice-chip" onclick="selectLocation('HSR Layout, Bangalore')">📍 HSR Layout</button>
        <button type="button" class="choice-chip" onclick="selectLocation('Sarjapur Road, Bangalore')">📍 Sarjapur Road</button>
        <button type="button" class="choice-chip" onclick="selectLocation('North Bangalore / Hebbal')">📍 North Bangalore</button>
        <button type="button" class="choice-chip" onclick="selectLocation('Hyderabad / Financial District')">📍 Hyderabad</button>
      </div>
    `;

    await addBotMessage(locationPromptHtml, 700);
  };

  // STEP 2: Handle Property Location Choice
  window.selectLocation = async function (location) {
    if (state.step !== 2 || state.isTyping) return;
    state.enquiry.location = location;
    addUserMessage(location);

    state.step = 3; // Moving to Square Footage
    const sqftPromptHtml = `
      <div class="bubble-text">
        <p>Great! We have ongoing and delivered marquee projects across <strong>${escapeHtml(location)}</strong>. 🏙️</p>
        <p>What is the approximate <strong>super built-up / carpet area</strong> of your space?</p>
      </div>
      <div class="wa-interactive-card">
        <button type="button" class="wa-action-btn" onclick="selectSqft('1,100 - 1,450 sq ft (2 BHK)')">
          <span class="wa-action-icon">📐</span> 1,100 – 1,450 sq ft (2 BHK)
        </button>
        <button type="button" class="wa-action-btn" onclick="selectSqft('1,500 - 2,100 sq ft (3 BHK)')">
          <span class="wa-action-icon">📐</span> 1,500 – 2,100 sq ft (3 BHK)
        </button>
        <button type="button" class="wa-action-btn" onclick="selectSqft('2,200 - 3,400 sq ft (4 BHK / Villa)')">
          <span class="wa-action-icon">📐</span> 2,200 – 3,400 sq ft (4 BHK / Villa)
        </button>
        <button type="button" class="wa-action-btn" onclick="selectSqft('3,500+ sq ft (Luxury Estate / Duplex)')">
          <span class="wa-action-icon">📐</span> 3,500+ sq ft (Luxury Estate / Duplex)
        </button>
      </div>
    `;

    await addBotMessage(sqftPromptHtml, 700);
  };

  // STEP 3: Handle Square Footage Choice
  window.selectSqft = async function (sqft) {
    if (state.step !== 3 || state.isTyping) return;
    state.enquiry.sqft = sqft;
    addUserMessage(sqft);

    state.step = 4; // Moving to Floor Plan Upload
    const floorPlanPromptHtml = `
      <div class="bubble-text">
        <p>Noted! <strong>${escapeHtml(sqft)}</strong> gives us a generous canvas for bespoke storage, false ceiling contours, and mood lighting. ✨</p>
        <p>Do you have an <strong>architectural floor plan or layout drawing</strong> available? Uploading it enables our architects to conduct preliminary spatial feasibility before our consultation.</p>
      </div>
      <div class="wa-interactive-card">
        <button type="button" class="wa-action-btn" style="background: #eef2ff; border-color: #c7d2fe; color: #4338ca;" onclick="triggerFloorPlanUpload()">
          <span class="wa-action-icon">📁</span> Upload Floor Plan (Image / PDF)
        </button>
        <button type="button" class="wa-action-btn" style="background: #fdf2f8; border-color: #fbcfe8; color: #be185d;" onclick="useSampleFloorPlan()">
          <span class="wa-action-icon">⚡</span> Use Sample 3BHK Blueprint (1,850 sq ft)
        </button>
        <button type="button" class="wa-action-btn" onclick="skipFloorPlan()">
          <span class="wa-action-icon">⏭️</span> Skip for now (Share during meeting)
        </button>
      </div>
    `;

    await addBotMessage(floorPlanPromptHtml, 750);
  };

  // Trigger Real File Upload
  window.triggerFloorPlanUpload = function () {
    if (fileInputElement) {
      fileInputElement.click();
    }
  };

  if (fileInputElement) {
    fileInputElement.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const fileName = file.name;
      const fileSize = (file.size / 1024 / 1024).toFixed(1) + ' MB';
      let fileUrl = 'assets/sample-floorplan.svg';

      if (file.type.startsWith('image/')) {
        fileUrl = URL.createObjectURL(file);
      }

      simulateFileUpload(fileName, fileSize, fileUrl);
      fileInputElement.value = ''; // Reset input
    });
  }

  // Use Sample Floor Plan
  window.useSampleFloorPlan = function () {
    simulateFileUpload('Sample_3BHK_Architectural_Plan.svg', '1.4 MB', 'assets/sample-floorplan.svg');
  };

  // Skip Floor Plan
  window.skipFloorPlan = async function () {
    if (state.step !== 4 || state.isTyping) return;
    state.enquiry.floorPlanAttached = false;
    state.enquiry.floorPlanName = 'Will share during consultation';
    state.enquiry.floorPlanUrl = '';
    addUserMessage('⏭️ Skip floor plan for now (I will share during the consultation)');

    moveToStepRequirements();
  };

  // Simulate File Upload Progress & Add Attachment Bubble
  async function simulateFileUpload(fileName, fileSize, previewUrl) {
    if (state.step !== 4 || state.isTyping) return;

    state.enquiry.floorPlanAttached = true;
    state.enquiry.floorPlanName = fileName;
    state.enquiry.floorPlanUrl = previewUrl;

    addUserMessage(`📎 Attaching Floor Plan: ${fileName}`);

    // Show upload progress message from user
    const uploadRow = document.createElement('div');
    uploadRow.className = 'msg-row outgoing';
    uploadRow.innerHTML = `
      <div class="bubble" style="width: 260px;">
        <div class="upload-progress-box">
          <div class="progress-header">
            <span>Uploading floor plan...</span>
            <span id="upload-percent">30%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" id="upload-bar" style="width: 30%;"></div>
          </div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(uploadRow);
    scrollToBottom();

    // Animate progress
    const bar = uploadRow.querySelector('#upload-bar');
    const percent = uploadRow.querySelector('#upload-percent');

    await new Promise(r => setTimeout(r, 350));
    bar.style.width = '75%';
    percent.textContent = '75%';
    await new Promise(r => setTimeout(r, 400));
    bar.style.width = '100%';
    percent.textContent = '100%';
    await new Promise(r => setTimeout(r, 200));

    // Replace with final WhatsApp Document Card
    uploadRow.innerHTML = `
      <div class="bubble" style="width: 280px; padding: 4px;">
        <div class="file-attachment-card">
          <div class="file-preview-img-wrap" onclick="openBlueprintModal('${escapeHtml(previewUrl)}', '${escapeHtml(fileName)}')">
            <img src="${previewUrl}" alt="Floor plan">
            <span class="file-preview-badge">📐 Click to enlarge</span>
          </div>
          <div class="file-info-bar">
            <div class="file-meta-col">
              <span class="file-name-text">${escapeHtml(fileName)}</span>
              <span class="file-size-text">${escapeHtml(fileSize)} • Architectural Drawing</span>
            </div>
            <div class="file-action-icon" onclick="openBlueprintModal('${escapeHtml(previewUrl)}', '${escapeHtml(fileName)}')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
          </div>
        </div>
        <div class="bubble-meta" style="margin-right: 6px; margin-bottom: 4px;">
          <span>${getCurrentTimeString()}</span>
          <span class="blue-ticks">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
              <path d="M11.05 1.5L4.5 8.05L1.95 5.5" stroke="#53bdeb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14.55 1.5L8 8.05" stroke="#53bdeb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    `;
    scrollToBottom();

    moveToStepRequirements();
  }

  // STEP 4: Move to Interior Requirements (Multi-select)
  async function moveToStepRequirements() {
    state.step = 5;

    const requirementsPromptHtml = `
      <div class="bubble-text">
        <p>✅ Floor plan successfully received &amp; registered in your file.</p>
        <p>Now, what is the <strong>scope of interior requirements</strong> you are looking for? (You can choose multiple items or pick full turnkey):</p>
      </div>
      <div class="chips-container" id="requirements-chips-wrap">
        <div class="choice-chip" data-val="Complete Turnkey (Full Home)" onclick="toggleRequirement(this)">
          <span class="chip-check">✓ </span>🛋️ Complete Turnkey (Full Home)
        </div>
        <div class="choice-chip" data-val="Modular Kitchen & Utility" onclick="toggleRequirement(this)">
          <span class="chip-check">✓ </span>🍳 Modular Kitchen &amp; Utility
        </div>
        <div class="choice-chip" data-val="Living Room & TV Wall Concept" onclick="toggleRequirement(this)">
          <span class="chip-check">✓ </span>📺 Living &amp; TV Accent Wall
        </div>
        <div class="choice-chip" data-val="Master & Guest Wardrobes" onclick="toggleRequirement(this)">
          <span class="chip-check">✓ </span>🛏️ Custom Wardrobes
        </div>
        <div class="choice-chip" data-val="False Ceiling & Ambient Lighting" onclick="toggleRequirement(this)">
          <span class="chip-check">✓ </span>✨ False Ceiling &amp; Lighting
        </div>
        <div class="choice-chip" data-val="Pooja Mandir Unit" onclick="toggleRequirement(this)">
          <span class="chip-check">✓ </span>🧘 Pooja Mandir
        </div>
        <div class="choice-chip" data-val="Home Office / Study Nook" onclick="toggleRequirement(this)">
          <span class="chip-check">✓ </span>💼 Home Office / Study
        </div>
        <div class="choice-chip" data-val="Balcony Decking & Planters" onclick="toggleRequirement(this)">
          <span class="chip-check">✓ </span>🌿 Balcony Decking
        </div>
      </div>
      <button type="button" class="confirm-btn" id="btn-confirm-requirements" onclick="confirmRequirements()">
        Confirm Requirements &amp; Generate Dossier ➡️
      </button>
    `;

    await addBotMessage(requirementsPromptHtml, 800);
  }

  // Toggle Requirement Chip
  window.toggleRequirement = function (elem) {
    const val = elem.getAttribute('data-val');
    elem.classList.toggle('selected');

    if (val === 'Complete Turnkey (Full Home)' && elem.classList.contains('selected')) {
      // Select all for turnkey
      const chips = document.querySelectorAll('#requirements-chips-wrap .choice-chip');
      chips.forEach(c => c.classList.add('selected'));
    }

    updateConfirmBtnLabel();
  };

  function getSelectedRequirements() {
    const selected = [];
    const chips = document.querySelectorAll('#requirements-chips-wrap .choice-chip.selected');
    chips.forEach(c => {
      selected.push(c.getAttribute('data-val'));
    });
    return selected;
  }

  function updateConfirmBtnLabel() {
    const selected = getSelectedRequirements();
    const btn = document.getElementById('btn-confirm-requirements');
    if (!btn) return;

    if (selected.length > 0) {
      btn.textContent = `Confirm (${selected.length} Scope Selected) & Generate Dossier ➡️`;
      btn.disabled = false;
    } else {
      btn.textContent = 'Please select at least one requirement ➡️';
      btn.disabled = false;
    }
  }

  // Confirm Requirements & Move to Final Summary
  window.confirmRequirements = async function () {
    if (state.step !== 5 || state.isTyping) return;

    let selected = getSelectedRequirements();
    if (selected.length === 0) {
      selected = ['Complete Turnkey (Full Home)', 'Modular Kitchen & Utility', 'Living & TV Accent Wall'];
    }

    state.enquiry.requirements = selected;
    addUserMessage(`📋 Selected Scope: ${selected.slice(0, 3).join(', ')}${selected.length > 3 ? ' +' + (selected.length - 3) + ' more' : ''}`);

    state.step = 6; // Summary step
    generateFinalSummary();
  };

  // STEP 6: Display Final Structured Project Enquiry Summary
  async function generateFinalSummary() {
    playBeep('success');

    const e = state.enquiry;
    const planDisplay = e.floorPlanAttached 
      ? `✅ Attached (${escapeHtml(e.floorPlanName)})`
      : 'Pending (Will discuss in consultation)';

    const summaryHtml = `
      <div class="bubble-text">
        <p>🎉 <strong>Enquiry Successfully Registered!</strong></p>
        <p>Thank you for trusting <strong>Intura Design Studio</strong>. Here is your structured project enquiry dossier:</p>
      </div>

      <div class="enquiry-summary-card">
        <div class="summary-header">
          <div class="summary-title-wrap">
            <img src="assets/intura-logo.jpg" alt="Intura" class="summary-logo-mini">
            <div>
              <div class="summary-title-text">INTURA DESIGN STUDIO</div>
              <div style="font-size: 10px; color: #fdba74; font-weight: 500;">Interiors With Aura</div>
            </div>
          </div>
          <span class="summary-ref-pill">${escapeHtml(e.refId)}</span>
        </div>

        <div class="summary-body">
          <div class="summary-status-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>Priority Enquiry Queued • Verified Homeowner</span>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-item-icon">🏢</span>
              <div class="summary-item-content">
                <span class="summary-item-label">Property Type</span>
                <span class="summary-item-value">${escapeHtml(e.propertyType || 'Apartment / Flat')}</span>
              </div>
            </div>

            <div class="summary-item">
              <span class="summary-item-icon">📍</span>
              <div class="summary-item-content">
                <span class="summary-item-label">Location</span>
                <span class="summary-item-value">${escapeHtml(e.location || 'Whitefield, Bangalore')}</span>
              </div>
            </div>

            <div class="summary-item">
              <span class="summary-item-icon">📐</span>
              <div class="summary-item-content">
                <span class="summary-item-label">Estimated Area</span>
                <span class="summary-item-value">${escapeHtml(e.sqft || '1,850 sq ft (3 BHK)')}</span>
              </div>
            </div>

            <div class="summary-item">
              <span class="summary-item-icon">📁</span>
              <div class="summary-item-content">
                <span class="summary-item-label">Floor Plan Blueprint</span>
                <span class="summary-item-value" style="color: ${e.floorPlanAttached ? '#059669' : '#64748b'}; font-size: 12px;">
                  ${planDisplay}
                </span>
              </div>
            </div>

            <div class="summary-item">
              <span class="summary-item-icon">🛋️</span>
              <div class="summary-item-content">
                <span class="summary-item-label">Scope of Work</span>
                <span class="summary-item-value" style="font-size: 12px; font-weight: 500;">
                  ${escapeHtml(e.requirements.join(', '))}
                </span>
              </div>
            </div>
          </div>

          <!-- Consultant Assigned Card -->
          <div class="summary-consultant-card">
            <div class="consultant-avatar">PS</div>
            <div class="consultant-info">
              <span class="consultant-name">Assigned: Ar. Priya Sharma</span>
              <span class="consultant-meta">Principal Interior Designer • 12+ Yrs Experience</span>
            </div>
          </div>

          <div style="font-size: 11px; color: #64748b; line-height: 1.4; padding: 2px 4px;">
            ⏱️ <strong>Next Steps:</strong> Our senior design architect will review your floor plan layout and contact you within <strong>24–48 hours</strong> with a customized 3D spatial moodboard and turnkey budget estimation.
          </div>
        </div>

        <!-- Summary Action Buttons -->
        <div class="summary-actions-grid">
          <button type="button" class="btn-summary-action btn-primary-action" onclick="downloadEnquiryDossier()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Summary
          </button>
          
          <button type="button" class="btn-summary-action btn-secondary-action" onclick="requestCallback()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Request Callback
          </button>

          <button type="button" class="btn-summary-action btn-secondary-action" style="grid-column: span 2;" onclick="restartConversation()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
            Start New Enquiry (Restart Demo)
          </button>
        </div>
      </div>
    `;

    await addBotMessage(summaryHtml, 1000);
  }

  // Handle Freeform Typed Text
  window.handleUserSubmit = function (e) {
    if (e) e.preventDefault();
    if (!chatInput) return;

    const text = chatInput.value.trim();
    if (!text || state.isTyping) return;

    chatInput.value = '';
    micIcon.style.display = 'block';
    sendIcon.style.display = 'none';

    // Route based on current step
    switch (state.step) {
      case 1:
        // User typed property type
        window.selectPropertyType(text);
        break;
      case 2:
        // User typed location
        window.selectLocation(text);
        break;
      case 3:
        // User typed sqft
        window.selectSqft(text);
        break;
      case 4:
        // In floor plan step, user typed message
        addUserMessage(text);
        addBotMessage(`
          <div class="bubble-text">
            <p>Thank you for noting that. We will record: <em>"${escapeHtml(text)}"</em> in your design brief.</p>
            <p>Let's proceed to your interior requirements:</p>
          </div>
        `, 600).then(() => {
          moveToStepRequirements();
        });
        break;
      case 5:
        // User typed requirements
        addUserMessage(text);
        state.enquiry.requirements = [text];
        generateFinalSummary();
        break;
      default:
        // General freeform response
        addUserMessage(text);
        addBotMessage(`
          <div class="bubble-text">
            <p>Thank you! Our design team at <strong>Intura Design Studio</strong> has noted your input: <em>"${escapeHtml(text)}"</em>.</p>
            <p>Would you like to start a new enquiry or review your current project dossier?</p>
          </div>
          <div class="wa-interactive-card">
            <button type="button" class="wa-action-btn" onclick="restartConversation()">
              <span class="wa-action-icon">🔄</span> Start New Enquiry
            </button>
          </div>
        `, 600);
        break;
    }
  };

  // Download Enquiry Summary Dossier
  window.downloadEnquiryDossier = function () {
    const e = state.enquiry;
    const textContent = `=====================================================
INTURA DESIGN STUDIO — INTERIORS WITH AURA
Axiino Technologies Interactive WhatsApp Demo
=====================================================
PROJECT ENQUIRY SUMMARY
Reference ID: ${e.refId}
Date & Time: ${e.timestamp || new Date().toLocaleString()}
Status: Verified Homeowner Enquiry (Queued)

CLIENT & PROPERTY DETAILS:
- Property Type: ${e.propertyType || 'Apartment / Flat'}
- Location: ${e.location || 'Whitefield, Bangalore'}
- Approximate Area: ${e.sqft || '1,850 sq ft'}
- Floor Plan Blueprint: ${e.floorPlanAttached ? e.floorPlanName : 'Pending consultation'}

SCOPE OF WORK:
${(e.requirements && e.requirements.length > 0 ? e.requirements : ['Complete Turnkey Interior Package']).map(r => '  • ' + r).join('\n')}

ASSIGNED LEAD ARCHITECT:
  Ar. Priya Sharma (Principal Interior Consultant)
  Intura Design Studio — Interiors With Aura
  Turnkey Execution • 45-Day Delivery Promise • 10-Yr Warranty
=====================================================
Demo Concept created by Axiino Technologies.
`;

    // Try downloading text file or trigger print
    try {
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${e.refId}_Intura_Design_Summary.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      window.print();
    }
  };

  // Request Instant Callback simulation
  window.requestCallback = function () {
    playBeep('success');
    alert('📞 Callback Requested!\n\nSenior Designer Ar. Priya Sharma will connect with you on this WhatsApp number within 15 minutes.');
  };

  // Restart Conversation
  function restartConversation() {
    playBeep('send');
    startConversation();
  }
  window.restartConversation = restartConversation;

  // Header Call Simulation
  window.triggerCallSimulation = function (type) {
    playBeep('receive');
    alert(`📞 Intura Design Studio (${type === 'video' ? 'Video' : 'Voice'} Call)\n\nThis is a concept demo created by Axiino Technologies for Intura Design Studio.`);
  };

  // Header Menu
  window.toggleHeaderMenu = function () {
    const choice = confirm('Intura Design Studio — WhatsApp AI Concierge\nConcept Demonstration by Axiino Technologies.\n\nClick OK to restart the conversation, or Cancel to continue.');
    if (choice) {
      restartConversation();
    }
  };

  // Blueprint Modal
  window.openBlueprintModal = function (url, title) {
    if (modalFloorplanImg) modalFloorplanImg.src = url || 'assets/sample-floorplan.svg';
    if (modalFloorplanTitle) modalFloorplanTitle.textContent = title || 'Architectural Floor Plan';
    if (blueprintModal) blueprintModal.classList.add('active');
  };

  window.closeBlueprintModal = function () {
    if (blueprintModal) blueprintModal.classList.remove('active');
  };

  // Attach button trigger
  if (btnAttachFile) {
    btnAttachFile.addEventListener('click', () => {
      if (state.step === 4) {
        triggerFloorPlanUpload();
      } else {
        const attachChoice = confirm('Would you like to attach a floor plan document now?');
        if (attachChoice) {
          triggerFloorPlanUpload();
        }
      }
    });
  }

  // Business Profile Modal
  const businessProfileModal = document.getElementById('business-profile-modal');
  const headerProfileClick = document.getElementById('header-profile-click');

  window.openBusinessProfile = function () {
    playBeep('receive');
    if (businessProfileModal) businessProfileModal.classList.add('active');
  };

  window.closeBusinessProfile = function () {
    if (businessProfileModal) businessProfileModal.classList.remove('active');
  };

  if (headerProfileClick) {
    headerProfileClick.addEventListener('click', openBusinessProfile);
  }

  // Close modal on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeBlueprintModal();
      window.closeBusinessProfile();
    }
  });

  // Start on load
  document.addEventListener('DOMContentLoaded', () => {
    startConversation();
  });

})();

