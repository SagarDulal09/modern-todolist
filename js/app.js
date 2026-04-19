/**
 * TASKFLOW PRO - SECURITY & IDENTITY CONTROLLER
 * Developed by Sagar Dulal | © 2026
 * Description: Manages OTP Validation, Session persistence, and Identity Gates.
 */

/* ============================================================
   1. SESSION MONITORING
   ============================================================ */

/**
 * Checks if a valid session exists on boot
 */
function checkAuthSession() {
    const user = JSON.parse(localStorage.getItem('todo_user'));
    const authContainer = document.getElementById('auth-container');
    const appScreen = document.getElementById('app-screen');

    if (user && user.id) {
        authContainer.classList.add('hidden');
        appScreen.classList.remove('hidden');
        initApp(); // Signal app.js to boot the dashboard
    } else {
        authContainer.classList.remove('hidden');
        appScreen.classList.add('hidden');
    }
}

/**
 * Toggles between Login and Registration Screens
 */
function toggleAuth(isRegister) {
    const login = document.getElementById('login-screen');
    const register = document.getElementById('register-screen');
    
    if (isRegister) {
        login.classList.add('hidden');
        register.classList.remove('hidden');
    } else {
        login.classList.remove('hidden');
        register.classList.add('hidden');
    }
}

/* ============================================================
   2. VALIDATION ENGINE (NEPAL & INDIA STANDARDS)
   ============================================================ */

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    // Regex for Nepal (+977) and India (+91)
    // Matches: +97798..., 97798..., 98..., +91..., etc.
    const nepalRegex = /^(?:\+977|977)?9[678]\d{8}$/;
    const indiaRegex = /^(?:\+91|91)?[6789]\d{9}$/;
    return nepalRegex.test(phone.replace(/\s/g, '')) || indiaRegex.test(phone.replace(/\s/g, ''));
}

/* ============================================================
   3. REGISTRATION & OTP SEQUENCE
   ============================================================ */

/**
 * Step 1: Request Security Token
 */
async function requestOTP() {
    const name = document.getElementById('reg-user').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const pass = document.getElementById('reg-pass').value;

    // Field Validation
    if (!name || name.length < 3) return showToast("Enter full legal name");
    if (!validateEmail(email)) return showToast("Valid professional email required");
    if (!validatePhone(phone)) return showToast("Only Nepal (+977) or India (+91) supported");
    if (pass.length < 6) return showToast("Password must be 6+ characters");

    APILoader.show();
    
    // Dispatch token via Cloud Backend
    const res = await apiRequest({ 
        action: 'sendOTP', 
        email: email, 
        name: name 
    });

    APILoader.hide();

    if (res.success) {
        document.getElementById('otp-area').classList.remove('hidden');
        document.getElementById('send-otp-btn').innerText = "Resend Token";
        showToast("Security Token Dispatched to Email");
    } else {
        showToast(res.message);
    }
}

/**
 * Step 2: Verify Token & Finalize Registration
 */
async function verifyAndRegister() {
    const otp = document.getElementById('reg-otp').value;
    const name = document.getElementById('reg-user').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const pass = document.getElementById('reg-pass').value;

    if (otp.length !== 6) return showToast("Enter 6-digit sequence");

    APILoader.show();

    // Validate OTP first
    const verifyRes = await apiRequest({ action: 'validateOTP', email: email, otp: otp });

    if (verifyRes.success) {
        // Finalize User Creation in DB
        const regRes = await apiRequest({
            action: 'registerUser',
            name: name,
            email: email,
            phone: phone,
            pass: pass
        });

        if (regRes.success) {
            showToast("Identity Verified. Profile Initialized.");
            // Log user in automatically
            const userData = { id: regRes.userId, name: name, email: email };
            localStorage.setItem('todo_user', JSON.stringify(userData));
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast(regRes.message);
        }
    } else {
        showToast(verifyRes.message);
    }
    
    APILoader.hide();
}

/* ============================================================
   4. LOGIN PROTOCOL
   ============================================================ */

document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const loginId = document.getElementById('login-id').value;
    const loginPass = document.getElementById('login-pass').value;

    APILoader.show();

    const res = await apiRequest({
        action: 'loginUser',
        loginId: loginId,
        loginPass: loginPass
    });

    APILoader.hide();

    if (res.success) {
        showToast(`Welcome back, ${res.user.name}`);
        localStorage.setItem('todo_user', JSON.stringify(res.user));
        setTimeout(() => location.reload(), 1000);
    } else {
        showToast(res.message);
    }
};

/* ============================================================
   5. EXTERNAL IDENTITY (GOOGLE ONE-TAP)
   ============================================================ */

function handleCredentialResponse(response) {
    // Decode JWT from Google
    const responsePayload = parseJwt(response.credential);
    
    const userData = {
        id: "G-" + responsePayload.sub,
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture
    };

    showToast("Google Identity Authorized");
    localStorage.setItem('todo_user', JSON.stringify(userData));
    setTimeout(() => location.reload(), 1000);
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}
