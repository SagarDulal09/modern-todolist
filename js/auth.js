/**
 * TASKFLOW PRO - SECURITY & IDENTITY CONTROLLER
 * Architected by Sagar Dulal | © 2026
 * Scope: Identity Verification, OTP Protocol, & Session Security
 */

// --- 1. UI TOGGLE LOGIC ---
function toggleAuth(isRegister) {
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    
    if (isRegister) {
        loginScreen.classList.add('hidden');
        registerScreen.classList.remove('hidden');
    } else {
        registerScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
    }
}

// --- 2. REGISTRATION & OTP PROTOCOL ---

/**
 * Dispatches a 6-digit security token to the user's email via the Cloud Engine.
 */
async function requestOTP() {
    const name = document.getElementById('reg-user').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();

    // Field Validation
    if (!name || !email || !phone || pass.length < 6) {
        return showToast("Complete all fields. Password must be 6+ chars.");
    }

    // Email Validation Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return showToast("Invalid Email Format");

    const res = await apiRequest({ 
        action: 'sendOTP', 
        email: email, 
        name: name 
    });

    if (res.success) {
        document.getElementById('otp-area').classList.remove('hidden');
        document.getElementById('send-otp-btn').innerText = "Resend Security Token";
        document.getElementById('send-otp-btn').classList.add('opacity-50');
        showToast("Verification Token Dispatched");
    } else {
        showToast(res.message || "Failed to dispatch token.");
    }
}

/**
 * Validates the OTP and commits the user to the permanent Database.
 */
async function verifyAndRegister() {
    const otp = document.getElementById('reg-otp').value.trim();
    const name = document.getElementById('reg-user').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();

    if (otp.length !== 6) return showToast("Enter the full 6-digit sequence");

    // Phase 1: Verify Token
    const verifyRes = await apiRequest({ 
        action: 'validateOTP', 
        email: email, 
        otp: otp 
    });

    if (verifyRes.success) {
        // Phase 2: Create User Profile
        const regRes = await apiRequest({ 
            action: 'registerUser', 
            name: name, 
            email: email, 
            phone: phone, 
            pass: pass 
        });

        if (regRes.success) {
            localStorage.setItem('todo_user', JSON.stringify({ 
                id: regRes.userId, 
                name: name, 
                email: email 
            }));
            showToast("Identity Verified. Initializing...");
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast(regRes.message);
        }
    } else {
        showToast(verifyRes.message || "Token Authorization Failed");
    }
}

// --- 3. LOGIN & ACCESS CONTROL ---

document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const loginId = document.getElementById('login-id').value.trim();
    const loginPass = document.getElementById('login-pass').value.trim();

    if (!loginId || !loginPass) return showToast("Credentials required");

    const res = await apiRequest({ 
        action: 'loginUser', 
        loginId: loginId, 
        loginPass: loginPass 
    });

    if (res.success) {
        localStorage.setItem('todo_user', JSON.stringify(res.user));
        showToast("Access Granted. Redirecting...");
        setTimeout(() => location.reload(), 1000);
    } else {
        showToast(res.message || "Invalid System Credentials");
    }
};

// --- 4. THIRD-PARTY IDENTITY (GOOGLE ONE-TAP) ---

/**
 * Handles the JWT response from Google's Authentication Servers.
 */
function handleCredentialResponse(response) {
    try {
        // Decoding the JWT (JSON Web Token) payload
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')));

        // Store Google Identity
        localStorage.setItem('todo_user', JSON.stringify({
            id: "G-" + payload.sub,
            name: payload.name,
            email: payload.email,
            avatar: payload.picture
        }));

        showToast("Signed in via Google Node");
        setTimeout(() => location.reload(), 1000);

    } catch (err) {
        console.error("Google Auth Decode Error:", err);
        showToast("External Identity Sync Failed");
    }
}

// --- 5. SESSION SECURITY ---

/**
 * Terminate session and clear sensitive local caches.
 */
function confirmLogout() {
    // Custom styled confirmation would go here
    if (confirm("Are you sure you want to terminate the secure session?")) {
        localStorage.removeItem('todo_user');
        // Clear active list state to prevent data leak on re-login
        localStorage.removeItem('tf_active_list'); 
        location.reload();
    }
}
