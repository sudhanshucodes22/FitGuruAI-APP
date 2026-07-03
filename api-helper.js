// Shared Frontend API Utility for FitGuru-AI
const API_BASE = window.location.origin;

// Retrieve headers with JWT token
function getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    return headers;
}

// Force login redirect if unauthenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const path = window.location.pathname;
    
    // Ignore authentication check for onboarding and auth pages
    if (path.endsWith('auth.html') || path.endsWith('index.html') || path === '/' || path === '') {
        return;
    }
    
    if (!token) {
        console.warn("Unauthorized. Redirecting to authentication portal...");
        window.location.href = 'auth.html';
    }
}

// Run auth check immediately
checkAuth();

// Utility to show premium toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-background border ${type === 'success' ? 'border-[#2ae500]/50' : 'border-error/50'} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md max-w-sm w-[90%] transition-all duration-300`;
    
    const icon = type === 'success' ? 'check_circle' : 'warning';
    const iconColor = type === 'success' ? 'text-[#2ae500]' : 'text-error';
    
    toast.innerHTML = `<span class="material-symbols-outlined ${iconColor}">${icon}</span><span class="text-xs font-mono-data uppercase">${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
