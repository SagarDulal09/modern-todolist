/* ============================================================
   1. SESSION MANAGEMENT (Check on Page Load)
   ============================================================ */

window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('todo_user');
    
    // If user is already logged in, skip the login screen
    if (savedUser) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        
        // Initialize the app logic from app.js
        if (typeof initApp === "function") {
            initApp();
        }
    }
});

/* ============================================================
   2. UI TOGGLES
   ============================================================ */

/**
 * Switch between Login and Register screens
 * @param {Boolean} showRegister - True to show register, False for login
 */
function toggleAuth(showRegister) {
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');

    if (showRegister) {
        loginScreen.classList.add('hidden');
        registerScreen.classList.remove('hidden');
    } else {
        loginScreen.classList.remove('hidden');
        registerScreen.classList.add('hidden');
    }
}

/* ============================================================
   3. AUTHENTICATION ACTIONS
   ============================================================ */

// HANDLE LOGIN
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const loginId = document.getElementById('login-id').value;
    const loginPass = document.getElementById('login-pass').value;

    if (typeof showToast === "function") showToast("Authenticating...");

    const res = await apiRequest({ 
        action: 'loginUser', 
        loginId: loginId, 
        loginPass: loginPass 
    });

    if (res.success) {
        // Store user data in browser memory
        localStorage.setItem('todo_user', JSON.stringify(res.user));
        
        // Switch screens
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        
        // Start the app
        initApp();
        if (typeof showToast === "function") showToast(`Welcome back, ${res.user.name}!`);
    } else {
        if (typeof showToast === "function") showToast(res.message || "Login failed", "error");
    }
};

// HANDLE REGISTRATION
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reg-user').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const pass = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-confirm').value;

    // Basic Validation
    if (pass !== confirm) {
        return showToast("Passwords do not match!", "error");
    }

    if (typeof showToast === "function") showToast("Creating account...");

    const res = await apiRequest({ 
        action: 'registerUser', 
        name, email, phone, pass 
    });

    if (res.success) {
        showToast("Registration successful! Please login.");
        toggleAuth(false); // Send user back to login screen
        document.getElementById('register-form').reset();
    } else {
        showToast(res.message || "Registration failed", "error");
    }
};

/* ============================================================
   4. GOOGLE ONE-TAP / SIGN-IN
   ============================================================ */

/**
 * Triggered by the Google Identity Services script in index.html
 */
async function handleCredentialResponse(response) {
    try {
        // Decode the JWT token from Google
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        
        const userData = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture
        };

        if (typeof showToast === "function") showToast("Syncing Google Account...");

        // Tell the database about this Google user
        const res = await apiRequest({ action: 'syncUser', user: userData });

        if (res.success) {
            localStorage.setItem('todo_user', JSON.stringify(res.user));
            location.reload(); // Refresh to enter app
        }
    } catch (e) {
        console.error("Google Auth Error:", e);
        if (typeof showToast === "function") showToast("Google Login failed", "error");
    }
}
