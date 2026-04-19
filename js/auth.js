/**
 * TASKFLOW PRO AUTHENTICATION SYSTEM
 * Developed by Sagar Dulal | © 2026
 * Features: JWT-style Session Management & Google Sync
 */

/* ============================================================
   1. SESSION GATEKEEPER
   ============================================================ */

/**
 * Validates the current session status.
 * Called immediately after the preloader finishes in app.js
 */
function checkAuthSession() {
    const savedUser = localStorage.getItem('todo_user');
    const authContainer = document.getElementById('auth-container');
    const appScreen = document.getElementById('app-screen');

    if (savedUser) {
        // High-end Transition: Hide Auth, Show App
        authContainer.classList.add('hidden');
        appScreen.classList.remove('hidden');
        
        // Boot the main application logic
        if (typeof initApp === "function") {
            initApp();
        }
    } else {
        // Reveal Login Screen with Animation
        authContainer.classList.remove('hidden');
        appScreen.classList.add('hidden');
        document.getElementById('login-screen').classList.add('animate-slide-up');
    }
}

/* ============================================================
   2. INTERFACE TOGGLES
   ============================================================ */

function toggleAuth(showRegister) {
    const login = document.getElementById('login-screen');
    const register = document.getElementById('register-screen');

    if (showRegister) {
        login.classList.add('hidden');
        register.classList.remove('hidden');
        register.classList.add('animate-slide-up');
    } else {
        register.classList.add('hidden');
        login.classList.remove('hidden');
        login.classList.add('animate-slide-up');
    }
}

/* ============================================================
   3. MANUAL AUTHENTICATION LOGIC
   ============================================================ */

// --- LOGIN SUBMISSION ---
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const loginId = document.getElementById('login-id').value;
    const loginPass = document.getElementById('login-pass').value;
    const btn = e.target.querySelector('button');

    btn.disabled = true;
    APILoader.show();

    const res = await apiRequest({ 
        action: 'loginUser', 
        loginId: loginId, 
        loginPass: loginPass 
    });

    if (res.success) {
        // Store User Data Locally
        localStorage.setItem('todo_user', JSON.stringify(res.user));
        
        // UI Transition
        showToast(`Welcome back, ${res.user.name}`);
        
        // Trigger page re-validation
        checkAuthSession();
    } else {
        showToast(res.message || "Invalid Authorization Credentials");
    }
    
    btn.disabled = false;
    APILoader.hide();
};

// --- REGISTRATION SUBMISSION ---
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const pass = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (pass !== confirm) {
        return showToast("Passwords synchronization failed!");
    }

    const btn = e.target.querySelector('button');
    btn.disabled = true;
    APILoader.show();

    const res = await apiRequest({ 
        action: 'registerUser', 
        name: document.getElementById('reg-user').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        pass: pass 
    });

    if (res.success) {
        showToast("Account Deployed! You may now login.");
        toggleAuth(false);
        e.target.reset();
    } else {
        showToast(res.message || "Registration sequence failed.");
    }
    
    btn.disabled = false;
    APILoader.hide();
};

/* ============================================================
   4. GOOGLE IDENTITY SERVICES INTEGRATION
   ============================================================ */

/**
 * Native Google Credential Handler
 */
async function handleCredentialResponse(response) {
    try {
        // Decode Google JWT
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')));
        
        const googleData = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture
        };

        APILoader.show();
        showToast("Syncing Google Cloud Account...");

        const res = await apiRequest({ action: 'syncUser', user: googleData });

        if (res.success) {
            localStorage.setItem('todo_user', JSON.stringify(res.user));
            showToast(`Verified: ${res.user.name}`);
            
            // Full refresh to ensure Google session headers are active
            location.reload();
        }
    } catch (err) {
        console.error("G-Auth Error:", err);
        showToast("Google Authentication Timeout.");
    } finally {
        APILoader.hide();
    }
}

console.log("%c Auth Module Secured ", "background: #10b981; color: #fff; border-radius: 4px;");
