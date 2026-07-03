import os
import re

RAW_DIR = '/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app/raw_screens'
OUT_DIR = '/Users/sudhanshu/.gemini/antigravity/scratch/fitguru-app'

# Premium Phone Simulator CSS to inject
SIMULATOR_STYLE = """
    <link href="app.css?v=3" rel="stylesheet">
    <script src="api-helper.js?v=2"></script>
"""

# iOS-Style Status Bar
STATUS_BAR = """
            <!-- iOS Status Bar -->
            <div class="status-bar">
                <span class="status-bar-time leading-none">09:41</span>
                <div class="status-bar-icons">
                    <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 0, 'wght' 600">signal_cellular_alt</span>
                    <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 0, 'wght' 600">wifi</span>
                    <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 0, 'wght' 600">battery_5_bar</span>
                </div>
            </div>
"""

# Dynamic Clock Script
CLOCK_SCRIPT = """
    <!-- Dynamic Clock script -->
    <script>
        function updateClock() {
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            const timeStr = hours + ':' + minutes;
            document.querySelectorAll('.status-bar-time').forEach(el => el.textContent = timeStr);
        }
        setInterval(updateClock, 1000);
        updateClock();
    </script>
"""

# Standardized Nav Bars for Flex Layout
def get_navbar(active_tab):
    tabs = [
        {"id": "home", "label": "Home", "href": "dashboard.html?v=4", "icon": "home"},
        {"id": "meals", "label": "Meals", "href": "scanner.html?v=4", "icon": "restaurant"},
        {"id": "tracker", "label": "Tracker", "href": "tracker.html?v=4", "icon": "grid_view"},
        {"id": "chat", "label": "AI Chat", "href": "coach.html?v=4", "icon": "forum"},
        {"id": "badges", "label": "Badges", "href": "rewards.html?v=4", "icon": "trophy"},
        {"id": "workouts", "label": "Workouts", "href": "exercises.html?v=4", "icon": "fitness_center"},
        {"id": "profile", "label": "Profile", "href": "profile.html?v=4", "icon": "person"},
    ]
    
    nav_items = []
    for tab in tabs:
        is_active = (tab["id"] == active_tab)
        if is_active:
            item_html = f"""
                <a class="flex flex-col items-center justify-center text-[#39ff14]" href="{tab['href']}">
                    <div class="w-11 h-11 rounded-xl border border-[#39ff14] bg-[#39ff14]/10 shadow-[0_0_10px_rgba(57,255,20,0.3)] flex items-center justify-center mb-0.5">
                        <span class="material-symbols-outlined text-xl font-bold" style="font-variation-settings: 'FILL' 1;">{tab['icon']}</span>
                    </div>
                    <span class="font-label-caps text-[8px] uppercase tracking-wider font-bold">{tab['label']}</span>
                </a>
            """
        else:
            item_html = f"""
                <a class="flex flex-col items-center justify-center text-[#8e8e93] hover:text-[#39ff14] opacity-75 hover:opacity-100 transition-all duration-200" href="{tab['href']}">
                    <div class="w-11 h-11 flex items-center justify-center mb-0.5">
                        <span class="material-symbols-outlined text-xl">{tab['icon']}</span>
                    </div>
                    <span class="font-label-caps text-[8px] uppercase tracking-wider">{tab['label']}</span>
                </a>
            """
        nav_items.append(item_html)
        
    joined_items = "\n".join(nav_items)
    
    return f"""
            <!-- Bottom Navigation Bar -->
            <nav class="absolute bottom-0 left-0 w-full bg-background/95 border-t border-white/10 flex justify-around items-center px-1 pb-3 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]" style="height: 84px;">
                {joined_items}
            </nav>
    """

def process_file(in_name, out_name, nav_type=None):
    in_path = os.path.join(RAW_DIR, in_name)
    out_path = os.path.join(OUT_DIR, out_name)
    
    with open(in_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Override screens config to force mobile layout inside the desktop iframe/frame
    screens_config = """theme: {
          screens: {
            'sm': '9999px',
            'md': '9999px',
            'lg': '9999px',
            'xl': '9999px',
            '2xl': '9999px',
          },"""
    html = re.sub(r'theme\s*:\s*\{', screens_config, html, flags=re.IGNORECASE)
    
    # 1. Inject external app.css link inside head
    html = html.replace('</head>', f'{SIMULATOR_STYLE}\n</head>', 1)
    
    # 2. Modify body formatting to center the iPhone simulator
    # Find opening body tag
    body_match = re.search(r'(<body[^>]*>)', html, re.IGNORECASE)
    if body_match:
        body_tag = body_match.group(1)
        # Standardize body class for centering
        new_body_tag = '<body class="bg-black text-[#e2e2e2] font-body-md overflow-y-auto flex items-center justify-center min-h-screen py-6 sm:py-0 select-none">'
        html = html.replace(body_tag, new_body_tag, 1)
    
    # 3. Create iPhone wrapper around original body content
    # We want to find the first tag after body and the last tag before </body>
    # And wrap everything inside:
    # <div class="iphone-container scale-[0.95] md:scale-100 transition-all duration-300">
    #     <div class="iphone-border"></div>
    #     <div class="iphone-reflection"></div>
    #     <div class="dynamic-island"><div class="camera-lens"></div></div>
    #     <div class="home-indicator"></div>
    #     <div class="iphone-screen flex flex-col">
    #         STATUS_BAR
    #         ... original body content ...
    #     </div>
    # </div>
    
    body_idx = html.find('<body')
    body_end_idx = html.find('>', body_idx)
    body_tag_full = html[body_idx:body_end_idx+1]
    
    # Get the remainder of the content
    content_start = body_end_idx + 1
    content_end = html.rfind('</body>')
    body_content = html[content_start:content_end]
    
    # Replace layout fixed/absolute elements with natural flex elements where appropriate
    # Remove original bottom navigation element completely so we can inject the standardized one
    # Find <nav> tag
    nav_pattern = re.compile(r'<nav[^>]*>.*?</nav>', re.DOTALL)
    body_content = nav_pattern.sub('', body_content)
    
    # For header: remove position absolute/fixed so it lies naturally after status bar
    # Let's search for '<header class="..."' or similar
    header_match = re.search(r'<header([^>]*)>', body_content, re.IGNORECASE)
    if header_match:
        header_tag = header_match.group(0)
        # Extract class content
        class_match = re.search(r'class="([^"]*)"', header_tag, re.IGNORECASE)
        if class_match:
            classes = class_match.group(1)
            # Remove top, left, fixed, absolute, z-50, backdrop-blur-xl etc.
            new_classes = classes.replace('fixed', '').replace('absolute', '').replace('top-0', '').replace('left-0', '').replace('z-50', '').replace('z-[60]', '').replace('w-full', '').strip()
            # Add flex-shrink-0 and standard margin/padding
            new_classes = 'w-full flex-shrink-0 z-20 ' + new_classes
            # If the header has bg-background/80 or similar, keep it or simplify
            new_header_tag = f'<header class="{new_classes}">'
            body_content = body_content.replace(header_tag, new_header_tag, 1)
            
            # Inject Back Button dynamically (except on welcome index.html screen)
            if out_name != "index.html":
                header_end_pos = body_content.find(new_header_tag) + len(new_header_tag)
                div_pos = body_content.find('<div', header_end_pos)
                if div_pos != -1:
                    div_end_bracket = body_content.find('>', div_pos)
                    if div_end_bracket != -1:
                        fallback_href = "index.html?v=4" if out_name in ["auth.html", "dashboard.html"] else "dashboard.html?v=4"
                        back_button_html = f"""
<button onclick="if(document.referrer && document.referrer.includes(window.location.host)) {{ window.history.back(); }} else {{ window.location.href='{fallback_href}'; }}" class="p-xs hover:bg-white/5 rounded-full transition-all duration-300 ease-out active:scale-95 text-on-surface-variant hover:text-primary mr-1 flex-shrink-0" title="Go Back">
    <span class="material-symbols-outlined text-xl leading-none">arrow_back</span>
</button>"""
                        body_content = body_content[:div_end_bracket+1] + back_button_html + body_content[div_end_bracket+1:]

    # For camera.html, since it doesn't use a <header> tag:
    if in_name == "ai_camera.html":
        radar_tag = '<span class="material-symbols-outlined text-primary-fixed-dim animate-pulse">radar</span>'
        back_btn_camera = """
<button onclick="if(document.referrer && document.referrer.includes(window.location.host)) { window.history.back(); } else { window.location.href='exercises.html?v=4'; }" class="p-xs hover:bg-white/10 rounded-full transition-all duration-300 ease-out active:scale-95 text-[#2ae500] hover:text-white mr-1 flex-shrink-0" title="Go Back">
    <span class="material-symbols-outlined text-xl leading-none">arrow_back</span>
</button>"""
        body_content = body_content.replace(radar_tag, back_btn_camera + radar_tag, 1)
            
    # For main: make it flex-grow and scrollable, remove absolute padding
    main_match = re.search(r'<main([^>]*)>', body_content, re.IGNORECASE)
    if main_match:
        main_tag = main_match.group(0)
        class_match = re.search(r'class="([^"]*)"', main_tag, re.IGNORECASE)
        if class_match:
            classes = class_match.group(1)
            # Remove absolute positioning padding
            new_classes = re.sub(r'pt-\d+', '', classes)
            new_classes = re.sub(r'pb-\d+', '', new_classes)
            new_classes = new_classes.replace('max-w-container-max', '').replace('mx-auto', '').replace('overflow-x-hidden', '').strip()
            # Ensure it has scroll-area and flex-grow
            new_classes = 'scroll-area flex-grow w-full ' + new_classes
            new_main_tag = f'<main class="{new_classes}">'
            body_content = body_content.replace(main_tag, new_main_tag, 1)
            
    # Replace h-screen and min-h-screen inside the screen frame with h-full / min-h-full
    body_content = body_content.replace('h-screen', 'h-full').replace('min-h-screen', 'min-h-full').replace('min-h-[100dvh]', 'min-h-full').replace('h-[100dvh]', 'h-full')
    
    # Remove any absolute fixed body backgrounds or convert them to absolute inside iphone-screen
    # In welcome screen / auth screen there are fixed backdrop layers. Let's make sure they are absolute
    body_content = body_content.replace('fixed inset-0', 'absolute inset-0').replace('fixed top-0', 'absolute top-0').replace('fixed bottom-0', 'absolute bottom-0').replace('fixed bottom-20', 'absolute bottom-[84px]').replace('fixed bottom-[84px]', 'absolute bottom-[84px]').replace('fixed left-0 w-full z-50" style="bottom: 84px;"', 'absolute left-0 w-full z-50" style="bottom: 84px;"')
    
    # Assemble wrapped page
    nav_html = get_navbar(nav_type) if nav_type else ''
    
    wrapped_body = f"""{body_tag_full}
    <div class="iphone-container">
        <div class="iphone-border"></div>
        <div class="iphone-reflection"></div>
        <div class="dynamic-island">
            <div class="camera-lens"></div>
        </div>
        <div class="home-indicator"></div>
        
        <div class="iphone-screen">
            {STATUS_BAR}
            
            {body_content}
            
            {nav_html}
        </div>
    </div>
    {CLOCK_SCRIPT}
</body></html>"""
    
    # Replace the old body tag and contents in html
    final_html = html[:body_idx] + wrapped_body
    
    # Write output
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(final_html)
        
    print(f"Processed: {in_name} -> {out_name}")

# Run converter for all files
process_file('welcome.html', 'index.html')
process_file('join_the_elite.html', 'auth.html')
process_file('dashboard.html', 'dashboard.html', 'home')
process_file('meal_scanner.html', 'scanner.html', 'meals')
process_file('ai_coach.html', 'coach.html', 'chat')
process_file('ai_coach_choose.html', 'exercises.html', 'workouts')
process_file('habit_tracker.html', 'tracker.html', 'tracker')
process_file('athlete_profile.html', 'profile.html', 'profile')
process_file('pro_elite_rewards.html', 'rewards.html', 'badges')
process_file('ai_camera.html', 'camera.html')
