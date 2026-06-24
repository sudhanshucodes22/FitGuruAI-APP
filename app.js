// List of screens configuration
const screens = [
    { id: 'welcome', title: 'Welcome Screen', file: 'raw_screens/welcome.html', category: 'Onboarding', desc: 'Splash screen and entry point' },
    { id: 'join_the_elite', title: 'Join the Elite', file: 'raw_screens/join_the_elite.html', category: 'Authentication', desc: 'Create account or sign in' },
    { id: 'dashboard', title: 'Command Center', file: 'raw_screens/dashboard.html', category: 'Dashboard', desc: 'Main hub of fitness data & stats' },
    { id: 'meal_scanner', title: 'Meal Scanner AI', file: 'raw_screens/meal_scanner.html', category: 'AI Vision', desc: 'Scan food via camera, nutrition breakdown' },
    { id: 'ai_coach', title: 'AI Chat Coach', file: 'raw_screens/ai_coach.html', category: 'Coaching', desc: 'Chat assistant for custom routines' },
    { id: 'ai_coach_choose', title: 'Exercise Selection', file: 'raw_screens/ai_coach_choose.html', category: 'Coaching', desc: 'List of exercises for form check' },
    { id: 'ai_camera', title: 'AI Pro Camera', file: 'raw_screens/ai_camera.html', category: 'AI Vision', desc: 'Form correction overlays & live camera feed' },
    { id: 'habit_tracker', title: 'Habit Tracker', file: 'raw_screens/habit_tracker.html', category: 'Tracking', desc: 'Daily habit checklist & consistency' },
    { id: 'pro_elite_rewards', title: 'Elite Rewards & Badges', file: 'raw_screens/pro_elite_rewards.html', category: 'Profile', desc: 'Streaks, badges, and virtual awards' },
    { id: 'athlete_profile', title: 'Athlete Profile', file: 'raw_screens/athlete_profile.html', category: 'Profile', desc: 'Stats progression, biometric curves, PR records' }
];

let activeScreenId = 'welcome';
const iframe = document.getElementById('app-frame');

// Render screens in sidebar
function renderScreens(filterText = '') {
    const listContainer = document.getElementById('screen-list');
    listContainer.innerHTML = '';

    // Group screens by category
    const categories = {};
    screens.forEach(screen => {
        if (filterText && !screen.title.toLowerCase().includes(filterText.toLowerCase()) && !screen.desc.toLowerCase().includes(filterText.toLowerCase())) {
            return;
        }
        if (!categories[screen.category]) {
            categories[screen.category] = [];
        }
        categories[screen.category].push(screen);
    });

    for (const [category, items] of Object.entries(categories)) {
        // Category Header
        const catHeader = document.createElement('div');
        catHeader.className = "font-['Geist'] text-[9px] text-[#39ff14] opacity-80 tracking-widest uppercase mt-4 mb-2 first:mt-0";
        catHeader.textContent = category;
        listContainer.appendChild(catHeader);

        // Category Items
        items.forEach(screen => {
            const item = document.createElement('button');
            item.className = `w-full text-left p-3 rounded-lg screen-item flex flex-col gap-1 transition-all ${screen.id === activeScreenId ? 'active' : ''}`;
            item.onclick = () => loadScreen(screen.id);

            const headerRow = document.createElement('div');
            headerRow.className = "flex justify-between items-center w-full";

            const title = document.createElement('span');
            title.className = "font-medium text-xs text-white";
            title.textContent = screen.title;
            headerRow.appendChild(title);

            const status = document.createElement('span');
            status.className = "font-['Geist'] text-[8px] opacity-40 px-1.5 py-0.5 rounded bg-white/5 border border-white/5";
            status.textContent = screen.file.split('/').pop();
            headerRow.appendChild(status);

            item.appendChild(headerRow);

            const desc = document.createElement('span');
            desc.className = "text-[10px] text-white/50 leading-snug line-clamp-1";
            desc.textContent = screen.desc;
            item.appendChild(desc);

            listContainer.appendChild(item);
        });
    }
}

// Load a specific screen in iframe
function loadScreen(screenId, triggerByIframe = false) {
    const screen = screens.find(s => s.id === screenId);
    if (!screen) return;

    activeScreenId = screenId;
    
    // Highlight sidebar
    renderScreens(document.getElementById('screen-search').value);

    // Update telemetry HUD
    document.getElementById('active-route').textContent = screen.file.split('/').pop();
    document.getElementById('flow-state').textContent = screen.category + ' Protocol';

    // Log the navigation event
    addLog(`[ROUTER] Loaded Screen: ${screen.title} (${screen.file})`, 'info');

    if (!triggerByIframe) {
        iframe.src = screen.file;
    }
}

// Inject listeners into the iframe content
function injectInterceptors() {
    try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc) return;

        // Auto-scroll inside iframe to top
        iframe.contentWindow.scrollTo(0, 0);

        // 1. Intercept standard anchors and nav bar items
        const navElements = doc.querySelectorAll('nav a, nav div, header button, footer button, main button, button, a');
        navElements.forEach(el => {
            el.addEventListener('click', (e) => {
                const text = el.textContent.trim().toLowerCase();
                const iconElement = el.querySelector('.material-symbols-outlined');
                const iconText = iconElement ? iconElement.textContent.trim().toLowerCase() : '';

                // Prevent original behavior if target is hash or simulation button
                if (el.tagName === 'A' && el.getAttribute('href') === '#') {
                    e.preventDefault();
                }

                // Match bottom nav elements
                // Coach
                if (text.includes('coach') || iconText === 'psychology') {
                    e.preventDefault();
                    e.stopPropagation();
                    loadScreen('ai_coach');
                    return;
                }
                // Scan
                if (text.includes('scan') || iconText === 'center_focus_strong') {
                    e.preventDefault();
                    e.stopPropagation();
                    loadScreen('meal_scanner');
                    return;
                }
                // Home
                if (text.includes('home') || iconText === 'dashboard') {
                    e.preventDefault();
                    e.stopPropagation();
                    loadScreen('dashboard');
                    return;
                }
                // Log or Habits
                if (text.includes('log') || text.includes('habits') || iconText === 'fitness_center' || iconText === 'check_circle') {
                    e.preventDefault();
                    e.stopPropagation();
                    loadScreen('habit_tracker');
                    return;
                }
                // Gym (toggles profile and rewards)
                if (text.includes('gym') || iconText === 'map' || iconText === 'military_tech') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (activeScreenId === 'athlete_profile') {
                        loadScreen('pro_elite_rewards');
                    } else {
                        loadScreen('athlete_profile');
                    }
                    return;
                }

                // Onboarding & Account Buttons
                if (text.includes('get started')) {
                    e.preventDefault();
                    loadScreen('join_the_elite');
                    return;
                }
                if (text.includes('create account') || text.includes('sign in')) {
                    e.preventDefault();
                    loadScreen('dashboard');
                    return;
                }

                // AI Coach choose exercises buttons
                if (text.includes('edit plan')) {
                    e.preventDefault();
                    loadScreen('ai_coach_choose');
                    return;
                }
                if (text.includes('start ai scan') || text.includes('resume plan')) {
                    e.preventDefault();
                    loadScreen('ai_camera');
                    return;
                }

                // AI Camera control / close buttons
                if (text.includes('end session') || iconText === 'close') {
                    e.preventDefault();
                    loadScreen('ai_coach_choose');
                    return;
                }

                // Meal Scanner buttons
                if (text.includes('log to meal plan')) {
                    e.preventDefault();
                    addLog('[MEAL_PLANNER] Logged Chicken Breast & Brown Rice to tracker.', 'success');
                    alert('Logged successfully! Redirecting to tracker.');
                    loadScreen('habit_tracker');
                    return;
                }
            }, true); // Use capture phase to ensure intercepting
        });

        // Generate specific telemetry messages based on loaded screen
        generateScreenTelemetry(activeScreenId);

    } catch (e) {
        console.error("Failed to inject interceptors: ", e);
        addLog(`[SYSTEM] Cross-origin or loading error: ${e.message}`, 'error');
    }
}

// Set iframe onload listener
iframe.addEventListener('load', () => {
    // Determine screen id from URL path loaded in iframe
    try {
        const url = iframe.contentWindow.location.pathname;
        const filename = url.substring(url.lastIndexOf('/') + 1);
        const matchedScreen = screens.find(s => s.file.endsWith(filename));
        if (matchedScreen && matchedScreen.id !== activeScreenId) {
            loadScreen(matchedScreen.id, true);
        }
    } catch (err) {
        // Fallback if cross-origin blocked (should not happen locally)
    }

    injectInterceptors();
});

// Telemetry console logging helper
const logsContainer = document.getElementById('console-logs');

function addLog(message, type = 'log') {
    const time = new Date().toLocaleTimeString();
    const logEl = document.createElement('div');
    
    let colorClass = 'text-white/60';
    if (type === 'info') colorClass = 'text-blue-400';
    if (type === 'success') colorClass = 'text-[#39ff14]';
    if (type === 'error') colorClass = 'text-red-400';
    if (type === 'ai') colorClass = 'text-purple-400';

    logEl.innerHTML = `<span class="text-white/20 select-none mr-2">[${time}]</span><span class="${colorClass}">${message}</span>`;
    logsContainer.appendChild(logEl);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

function clearConsole() {
    logsContainer.innerHTML = '';
    addLog('[SYSTEM] Console cleared.', 'info');
}

// Generate logs representing background activity
function generateScreenTelemetry(screenId) {
    if (screenId === 'welcome') {
        addLog('[ONBOARDING] Initializing welcome splash sequence...', 'info');
        addLog('[ONBOARDING] Awaiting user ignition (Get Started)...', 'info');
    } else if (screenId === 'join_the_elite') {
        addLog('[AUTH] User navigated to Elite Gatekeeper.', 'info');
        addLog('[AUTH] Awaiting credentials sign-in/OAuth action.', 'info');
    } else if (screenId === 'dashboard') {
        addLog('[TELEMETRY] Connected to Command Center. Syncing biometric payload...', 'success');
        addLog('[AI_STATS] Heartrate: 74BPM | Active calories: 412kcal synced.', 'success');
        addLog('[FITGURU_OS] Running background firmware optimization.', 'info');
    } else if (screenId === 'meal_scanner') {
        addLog('[AI_VISION] Initializing food viewfinder scanner...', 'info');
        addLog('[AI_VISION] Tracking active bounding boxes: [Chicken Breast, Brown Rice]', 'ai');
        addLog('[AI_VISION] Nutrition analysis calculated: 542 kcal, 42g protein.', 'ai');
    } else if (screenId === 'ai_coach') {
        addLog('[COACH] Loading personalized coach model AI_CORE_v2.5...', 'info');
        addLog('[COACH] Chat state ready. Last query: "Ready to crush your goals today, Alex?"', 'ai');
    } else if (screenId === 'ai_coach_choose') {
        addLog('[COACH] Displaying curated training protocol selection.', 'info');
        addLog('[COACH] Exercises calibrated: Bench Press, Deadlift, Squat, Overhead Press.', 'info');
    } else if (screenId === 'ai_camera') {
        addLog('[AI_VISION] LIVE CAMERA CORE INITIATED.', 'info');
        addLog('[AI_VISION] JARVIS_V4.2 loading skeletal overlay nodes...', 'ai');
        addLog('[AI_VISION] Form parameters active. Accuracy goal: 95%+', 'ai');
    } else if (screenId === 'habit_tracker') {
        addLog('[TRACKER] Fetching habit matrix database...', 'info');
        addLog('[TRACKER] Weekly habits consistency score calculated: 85%', 'success');
    } else if (screenId === 'pro_elite_rewards') {
        addLog('[REWARDS] User reached Centurion streak (Level 42 Athlete).', 'success');
        addLog('[REWARDS] Render 3D badges rendering in DOM overlay.', 'info');
    } else if (screenId === 'athlete_profile') {
        addLog('[PROFILE] Displaying athlete historical records.', 'info');
        addLog('[PROFILE] Loaded personal records: Bench Press (185 kg), Deadlift (220 kg).', 'success');
    }
}

// Reset the entire app sequence
function resetIframe() {
    loadScreen('welcome');
}

// Hook Search Input
document.getElementById('screen-search').addEventListener('input', (e) => {
    renderScreens(e.target.value);
});

// Initialize Console logs and list
addLog('[SYSTEM] FitGuru Cockpit Simulator Initialized Successfully.', 'success');
addLog('[SYSTEM] All 10 Stitch screen templates verified in filesystem.', 'info');
renderScreens();
