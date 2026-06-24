import os
import re

RAW_DIR = '/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app/raw_screens'
OUT_DIR = '/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app'

# Mobile container CSS styles to inject
CONTAINER_CSS = """
        /* Premium Mobile Container styling */
        .app-container {
            max-width: 480px;
            width: 100%;
            height: 100vh;
            background-color: #050505;
            position: relative;
            margin: 0 auto;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            border-left: 1px solid rgba(255, 255, 255, 0.05);
            border-right: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 0 50px rgba(0,0,0,0.9);
        }
        
        /* Custom scrollable area styling */
        .scroll-area {
            flex-grow: 1;
            overflow-y: auto;
            scrollbar-width: none; /* Firefox */
        }
        .scroll-area::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
        }
        
        /* Ensure fixed components position absolutely inside relative container */
        .app-container .absolute-header {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
        }
        .app-container .absolute-nav {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
        }
"""

# Scroll reset script to prevent Chrome auto-scroll bugs
SCROLL_RESET_JS = """
    <!-- Scroll Reset Script to Fix Chrome Auto-Scroll Bug -->
    <script>
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        function resetMainScroll() {
            const main = document.querySelector('.scroll-area');
            if (main) {
                main.scrollTop = 0;
            }
        }
        window.addEventListener('load', resetMainScroll);
        document.addEventListener('DOMContentLoaded', resetMainScroll);
        setTimeout(resetMainScroll, 50);
        setTimeout(resetMainScroll, 200);
        setTimeout(resetMainScroll, 500);
    </script>
"""

# Standard bottom navigation bars for each screen type
NAVBARS = {
    'home': """
        <nav class="absolute-nav absolute bottom-0 left-0 w-full h-20 bg-background/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-4 pb-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="coach.html">
                <span class="material-symbols-outlined">psychology</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Coach</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="scanner.html">
                <span class="material-symbols-outlined">center_focus_strong</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Scan</span>
            </a>
            <a class="flex flex-col items-center justify-center text-[#39ff14] bg-[#39ff14]/10 rounded-xl p-2 px-4 scale-105" href="dashboard.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">dashboard</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase font-bold">Home</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="tracker.html">
                <span class="material-symbols-outlined">fitness_center</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Log</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="profile.html">
                <span class="material-symbols-outlined">map</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Gym</span>
            </a>
        </nav>
    """,
    'coach': """
        <nav class="absolute-nav absolute bottom-0 left-0 w-full h-20 bg-background/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-4 pb-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <a class="flex flex-col items-center justify-center text-[#39ff14] bg-[#39ff14]/10 rounded-xl p-2 px-4 scale-105" href="coach.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">psychology</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase font-bold">Coach</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="scanner.html">
                <span class="material-symbols-outlined">center_focus_strong</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Scan</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="dashboard.html">
                <span class="material-symbols-outlined">dashboard</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Home</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="tracker.html">
                <span class="material-symbols-outlined">fitness_center</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Log</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="profile.html">
                <span class="material-symbols-outlined">map</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Gym</span>
            </a>
        </nav>
    """,
    'scan': """
        <nav class="absolute-nav absolute bottom-0 left-0 w-full h-20 bg-background/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-4 pb-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="coach.html">
                <span class="material-symbols-outlined">psychology</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Coach</span>
            </a>
            <a class="flex flex-col items-center justify-center text-[#39ff14] bg-[#39ff14]/10 rounded-xl p-2 px-4 scale-105" href="scanner.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">center_focus_strong</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase font-bold">Scan</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="dashboard.html">
                <span class="material-symbols-outlined">dashboard</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Home</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="tracker.html">
                <span class="material-symbols-outlined">fitness_center</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Log</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="profile.html">
                <span class="material-symbols-outlined">map</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Gym</span>
            </a>
        </nav>
    """,
    'log': """
        <nav class="absolute-nav absolute bottom-0 left-0 w-full h-20 bg-background/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-4 pb-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="coach.html">
                <span class="material-symbols-outlined">psychology</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Coach</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="scanner.html">
                <span class="material-symbols-outlined">center_focus_strong</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Scan</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="dashboard.html">
                <span class="material-symbols-outlined">dashboard</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Home</span>
            </a>
            <a class="flex flex-col items-center justify-center text-[#39ff14] bg-[#39ff14]/10 rounded-xl p-2 px-4 scale-105" href="tracker.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">fitness_center</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase font-bold">Log</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="profile.html">
                <span class="material-symbols-outlined">map</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Gym</span>
            </a>
        </nav>
    """,
    'gym_profile': """
        <nav class="absolute-nav absolute bottom-0 left-0 w-full h-20 bg-background/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-4 pb-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="coach.html">
                <span class="material-symbols-outlined">psychology</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Coach</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="scanner.html">
                <span class="material-symbols-outlined">center_focus_strong</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Scan</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="dashboard.html">
                <span class="material-symbols-outlined">dashboard</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Home</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="tracker.html">
                <span class="material-symbols-outlined">fitness_center</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Log</span>
            </a>
            <a class="flex flex-col items-center justify-center text-[#39ff14] bg-[#39ff14]/10 rounded-xl p-2 px-4 scale-105" href="rewards.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">map</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase font-bold">Gym</span>
            </a>
        </nav>
    """,
    'gym_rewards': """
        <nav class="absolute-nav absolute bottom-0 left-0 w-full h-20 bg-background/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-4 pb-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="coach.html">
                <span class="material-symbols-outlined">psychology</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Coach</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="scanner.html">
                <span class="material-symbols-outlined">center_focus_strong</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Scan</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="dashboard.html">
                <span class="material-symbols-outlined">dashboard</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Home</span>
            </a>
            <a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-[#39ff14] opacity-70 hover:opacity-100 transition-all duration-200" href="tracker.html">
                <span class="material-symbols-outlined">fitness_center</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase">Log</span>
            </a>
            <a class="flex flex-col items-center justify-center text-[#39ff14] bg-[#39ff14]/10 rounded-xl p-2 px-4 scale-105" href="profile.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">military_tech</span>
                <span class="font-label-caps text-[10px] mt-1 uppercase font-bold">Gym</span>
            </a>
        </nav>
    """
}

def process_file(in_name, out_name, nav_type=None):
    in_path = os.path.join(RAW_DIR, in_name)
    out_path = os.path.join(OUT_DIR, out_name)
    
    with open(in_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # 1. Inject Styles
    style_insert = CONTAINER_CSS
    if '</style>' in html:
        html = html.replace('</style>', style_insert + '\n</style>', 1)
    else:
        # Create style block
        html = html.replace('</head>', f'<style>{style_insert}</style>\n</head>', 1)
    
    # 2. Modify body wrapper
    # We want to wrap the contents inside the <body> tag in a <div class="app-container">
    # First, let's find the body content. We find the opening <body> tag.
    body_match = re.search(r'(<body[^>]*>)', html, re.IGNORECASE)
    if body_match:
        body_tag = body_match.group(1)
        # Wrap everything between <body> and </body> in the app-container
        # We also need to close it before </body>
        html = html.replace(body_tag, f'{body_tag}\n    <div class="app-container">', 1)
        html = html.replace('</body>', '    </div>\n</body>', 1)
    
    # 3. Handle fixed/absolute classes
    # Background and HUD scanline elements that were fixed inset-0 should be absolute inset-0
    # Search for classes: fixed inset-0, fixed top-0, fixed bottom-0, fixed right-xl, fixed w-4 h-4 etc.
    # But wait, we only want to change fixed to absolute if they are INSIDE the app-container.
    # In Tailwind, class lists are inside quotes. Let's do replacements:
    # "fixed inset-0" -> "absolute inset-0"
    # "fixed top-0 w-full" -> "absolute-header absolute top-0 left-0 w-full"
    # "fixed bottom-0 w-full" -> "absolute-nav absolute bottom-0 left-0 w-full"
    # "fixed right-xl" -> "absolute right-xl"
    # "fixed top-20" -> "absolute top-20"
    # "fixed bottom-20" -> "absolute bottom-20"
    # "fixed top-0 left-0" -> "absolute top-0 left-0"
    # "fixed bottom-0 left-0" -> "absolute bottom-0 left-0"
    # "fixed bottom-0 left-1/2" -> "absolute bottom-0 left-1/2"
    # "fixed w-4 h-4" -> "absolute w-4 h-4"
    # Let's perform these string replacements:
    replacements = [
        ('class="fixed inset-0', 'class="absolute inset-0'),
        ('class="fixed top-0 w-full', 'class="absolute-header absolute top-0 left-0 w-full'),
        ('class="fixed bottom-0 w-full', 'class="absolute-nav absolute bottom-0 left-0 w-full'),
        ('class="fixed right-xl', 'class="absolute right-xl'),
        ('class="fixed top-20', 'class="absolute top-20'),
        ('class="fixed bottom-20', 'class="absolute bottom-20'),
        ('class="fixed top-0 left-0', 'class="absolute top-0 left-0'),
        ('class="fixed bottom-0 left-0', 'class="absolute bottom-0 left-0'),
        ('class="fixed bottom-0 left-1/2', 'class="absolute bottom-0 left-1/2'),
        ('class="fixed w-4 h-4', 'class="absolute w-4 h-4'),
        # Single quotes or spaces variants
        ('fixed inset-0', 'absolute inset-0'),
        ('fixed top-0', 'absolute-header absolute top-0 left-0'),
        ('fixed bottom-0', 'absolute-nav absolute bottom-0 left-0'),
        ('fixed right-xl', 'absolute right-xl'),
        ('fixed top-20', 'absolute top-20'),
        ('fixed bottom-20', 'absolute bottom-20'),
        ('fixed top-0 left-0', 'absolute top-0 left-0'),
        ('fixed bottom-0 left-0', 'absolute bottom-0 left-0'),
        ('fixed w-4 h-4', 'absolute w-4 h-4'),
    ]
    for old, new in replacements:
        html = html.replace(old, new)
        
    # 4. Convert <main> or content area to be scrollable
    # We want to change `<main class="pt-24 pb-32...` to `<main class="scroll-area pt-24 pb-24...`
    # Let's find `<main[^>]*>` tag
    main_match = re.search(r'(<main[^>]*>)', html, re.IGNORECASE)
    if main_match:
        main_tag = main_match.group(1)
        # Extract classes
        class_match = re.search(r'class="([^"]*)"', main_tag, re.IGNORECASE)
        if class_match:
            classes = class_match.group(1)
            # Remove fixed max width from main so it doesn't break mobile aspect ratio
            new_classes = classes.replace('max-w-container-max', '').replace('mx-auto', '').strip()
            # Ensure it has scroll-area
            if 'scroll-area' not in new_classes:
                new_classes = 'scroll-area ' + new_classes
            # Adjust padding-bottom so it is pt-20 pb-24 (which fits under the header/footer)
            # If pb-32 exists, change to pb-24. If pb-48 exists, change to pb-24
            new_classes = re.sub(r'pb-\d+', 'pb-24', new_classes)
            new_classes = re.sub(r'pt-\d+', 'pt-20', new_classes)
            new_main_tag = f'<main class="{new_classes}">'
            html = html.replace(main_tag, new_main_tag, 1)
            
    # 5. Standardize Navigation
    if nav_type and nav_type in NAVBARS:
        # Let's find the bottom nav tag `<nav[^>]*>...</nav>`
        # Note: some files might have multiple navs or none. We search for the bottom nav element.
        # Often it is a <nav> that contains icons, or has fixed/absolute bottom-0 class.
        # Let's search for `<nav[^>]*>.*?</nav>` at the bottom of the HTML
        nav_pattern = re.compile(r'<nav[^>]*>.*?</nav>', re.DOTALL)
        navs = list(nav_pattern.finditer(html))
        if navs:
            # We replace the last nav with our standardized one
            last_nav = navs[-1]
            html = html[:last_nav.start()] + NAVBARS[nav_type] + html[last_nav.end():]
        else:
            # If no nav tag exists, we insert it right before the closing </div> of the app-container
            # (which is just before `</div>\n</body>`)
            insert_idx = html.rfind('</div>\n</body>')
            if insert_idx != -1:
                html = html[:insert_idx] + NAVBARS[nav_type] + html[insert_idx:]

    # 6. Inject Scroll Reset Script
    # Insert it right before the closing `</body>` tag
    html = html.replace('</body>', SCROLL_RESET_JS + '\n</body>', 1)
    
    # 7. Write processed file
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
        
    print(f"Processed: {in_name} -> {out_name}")

# Now let's convert each of the pages
# Index Page
process_file('welcome.html', 'index.html')
# Auth Page
process_file('join_the_elite.html', 'auth.html')
# Dashboard Page
process_file('dashboard.html', 'dashboard.html', 'home')
# Meal Scanner Page
process_file('meal_scanner.html', 'scanner.html', 'scan')
# AI Coach Page
process_file('ai_coach.html', 'coach.html', 'coach')
# Exercises Selection Page
process_file('ai_coach_choose.html', 'exercises.html', 'coach')
# Habit Tracker Page
process_file('habit_tracker.html', 'tracker.html', 'log')
# Athlete Profile Page
process_file('athlete_profile.html', 'profile.html', 'gym_profile')
# Pro Elite Rewards Page
process_file('pro_elite_rewards.html', 'rewards.html', 'gym_rewards')
# AI Camera Page
process_file('ai_camera.html', 'camera.html')
