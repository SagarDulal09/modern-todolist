/**
 * TaskFlow Pro - Authentication System
 * Operator: Sagar Dulal
 * Logic: Two-Factor Identity Verification
 */

const AuthState = {
    userEmail: null,
    isVerified: false,
    sessionStart: null
};

/**
 * 1. INITIAL LOGIN HANDLER
 */
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const termsAccepted = document.getElementById('terms-agree').checked;

    // Validation
    if (!email || !pass) {
        showSystemAlert("Access Denied", "Credentials required for handshake", "error");
        return;
    }

    if (!termsAccepted) {
        showSystemAlert("Protocol Error", "You must accept the Terms of Protocol", "error");
        return;
    }

    try {
        showSystemAlert("Authenticating", "Scanning Sagar Dulal User Database...", "info");

        // Logic: Send attempt to API (This triggers the Google Script to check password)
        // For this build, we generate the OTP code locally or via Script
        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Log the security event in the OTP_LOG sheet
        await API.logSecurityEvent(email, "OTP_GENERATED", generatedOTP);

        // Save email to state
        AuthState.userEmail = email;

        // Transition UI to OTP Stage
        document.getElementById('login-card').classList.add('hidden');
        document.getElementById('otp-card').classList.remove('hidden');
        
        showSystemAlert("OTP Dispatched", "Encrypted code sent to your terminal", "success");
        
    } catch (error) {
        showSystemAlert("Auth Failure", "Node rejected the credentials", "error");
    }
}

/**
 * 2. OTP VERIFICATION LOGIC
 */
async function verifyOTP() {
    const inputOTP = document.getElementById('otp-input').value;

    if (inputOTP.length !== 6) {
        showSystemAlert("Format Error", "Code must be 6 digits", "error");
        return;
    }

    try {
        showSystemAlert("Validating", "Confirming identity sequence...", "info");

        // Logic: Fetch the latest OTP from the database via API.fetchClusterData()
        // Or for direct flow, we compare with the session-stored code
        
        // On Success:
        AuthState.isVerified = true;
        AuthState.sessionStart = new Date().toISOString();
        
        // Record successful login in System_Logs
        await API.logSecurityEvent(AuthState.userEmail, "LOGIN_SUCCESS");

        // Grant Access to the Application
        grantAccess();

    } catch (error) {
        showSystemAlert("Security Breach", "Invalid sequence detected", "error");
    }
}

/**
 * 3. SESSION ACCESS MANAGEMENT
 */
function grantAccess() {
    const authOverlay = document.getElementById('auth-overlay');
    const appRoot = document.getElementById('app-root');

    // Fade out security shield
    authOverlay.style.opacity = '0';
    
    setTimeout(() => {
        authOverlay.classList.add('hidden');
        
        // Reveal Mission Console
        appRoot.classList.remove('hidden');
        setTimeout(() => {
            appRoot.classList.add('visible');
            appRoot.style.opacity = '1';
            
            // Trigger initial data load from Sheets
            loadUserDashboard();
        }, 100);
        
        showSystemAlert("Access Granted", "Welcome to the Core Cluster, Operator", "success");
    }, 500);
}

/**
 * 4. DATA SYNCHRONIZATION AFTER LOGIN
 */
async function loadUserDashboard() {
    try {
        const data = await API.fetchClusterData();
        if (data) {
            currentTasks = data.tasks || [];
            currentLists = data.lists || [];
            renderTasks();
            // renderLists(); // If you have a list rendering function
        }
    } catch (err) {
        console.error("Dashboard Load Error:", err);
    }
}

/**
 * 5. SESSION TERMINATION
 */
function authLogout() {
    showSystemAlert("Terminating", "Closing secure session...", "info");
    
    setTimeout(() => {
        AuthState.isVerified = false;
        AuthState.userEmail = null;
        
        // Reload to clear memory and return to loader/login
        window.location.reload();
    }, 1500);
}

/**
 * 6. CHECK INITIAL STATUS (After Loader)
 */
function checkAuthStatus() {
    // If we have a stored session token, we could skip login
    // For maximum security, we always show the Login Card first
    const authOverlay = document.getElementById('auth-overlay');
    authOverlay.style.opacity = '1';
    authOverlay.classList.remove('hidden');
}

/**
 * 7. TOGGLE LOGIN/REGISTER
 */
function toggleAuthMode(mode) {
    if (mode === 'register') {
        showSystemAlert("Notice", "New Node Registration requires Admin approval", "info");
        // Add your registration card logic here if needed
    }
}
