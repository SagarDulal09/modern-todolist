/**
 * TaskFlow Authentication Handler
 * Developed by Sagar Dulal | © 2026
 */

/* ============================================================
   1. SESSION INITIALIZATION
   ============================================================ */

/**
 * Checks if a user is already logged in. 
 * This is called after the preloader finishes in app.js
 */
function checkAuthSession() {
    const savedUser = localStorage.getItem('todo_user');
    const authContainer = document.getElementById('auth-container');
    const appScreen = document.getElementById('app-screen');

    if (savedUser) {
        authContainer.classList.add('hidden');
        appScreen.classList.remove('hidden');
        
        // Initialize the main app logic
        if (typeof initApp === "function") {
            initApp();
        }
    } else {
        authContainer.classList.remove('hidden');
        appScreen.classList.add('hidden');
    }
}

/* ============================================================
   2. UI TOGGLES (Login <-> Register)
   ============================================================ */

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
   3. AUTHENTICATION LOGIC
   ============================================================ */

// --- LOGIN HANDLER ---
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const loginId = document.getElementById('login-id').value;
    const loginPass = document.getElementById('login-pass').value;
    const submitBtn = e.target.querySelector('button');

    submitBtn.disabled = true;
    showToast("Verifying Credentials...");

    const res = await apiRequest({ 
        action: 'loginUser', 
        loginId: loginId, 
        loginPass: loginPass 
    });

    if (res.success) {
        localStorage.setItem('todo_user', JSON.stringify(res.user));
        
        // UI Transition
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        
        showToast(`Welcome, ${res.user.name}`);
        initApp(); // Start loading user data
    } else {
        showToast(res.message || "Invalid Login Details", "error");
    }
    submitBtn.disabled = false;
};

// --- REGISTRATION HANDLER ---
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reg-user').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const pass = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (pass !== confirm) {
        return showToast("Passwords do not match!", "error");
    }

    showToast("Creating Your Account...");

    const res = await apiRequest({ 
        action: 'registerUser', 
        name, email, phone, pass 
    });

    if (res.success) {
        showToast("Registration Successful! Please Login.");
        toggleAuth(false); // Switch to login screen
        e.target.reset();
    } else {
        showToast(res.message || "Registration Failed", "error");
    }
};

/* ============================================================
   4. GOOGLE ONE-TAP AUTHENTICATION
   ============================================================ */

/**
 * Handles the response from the Google Identity Services
 */
async function handleCredentialResponse(response) {
    try {
        // Decode the Google JWT Token
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        
        const googleUser = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture
        };

        showToast("Syncing Google Account...");

        const res = await apiRequest({ action: 'syncUser', user: googleUser });

        if (res.success) {
            localStorage.setItem('todo_user', JSON.stringify(res.user));
            showToast(`Connected as ${res.user.name}`);
            
            // Reload to apply all session settings
            location.reload();
        }
    } catch (error) {
        console.error("Google Auth Error:", error);
        showToast("Google Authentication Failed", "error");
    }
}

console.log("Auth Module Loaded | Powered by Sagar Dulal");
