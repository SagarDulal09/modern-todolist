function toggleAuth(showRegister) {
    document.getElementById('login-screen').classList.toggle('hidden', showRegister);
    document.getElementById('register-screen').classList.toggle('hidden', !showRegister);
}

// Handle Registration
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    
    // Check passwords match
    const pass = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-confirm').value;
    if (pass !== confirm) return showToast("Passwords do not match", "error");

    const user = {
        name: document.getElementById('reg-user').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        password: pass,
        id: "U" + Date.now()
    };

    showToast("Attempting Registration...");
    
    try {
        const res = await apiRequest({ action: 'registerUser', user });
        
        if (res.success) {
            showToast("Registration Success! Please Login.");
            toggleAuth(false);
        } else {
            // This will show the ACTUAL error from Google Sheets
            alert("Registration Failed: " + (res.message || res.error || "Unknown Error"));
        }
    } catch (err) {
        alert("Network Error: " + err.message);
    }
};

// Handle Login
// Handle Login
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const loginId = document.getElementById('login-id').value;
    const loginPass = document.getElementById('login-pass').value;

    if (typeof showToast === "function") showToast("Authenticating...");

    try {
        const res = await apiRequest({ 
            action: 'loginUser', 
            loginId: loginId, 
            loginPass: loginPass 
        });

        if (res.success) {
            localStorage.setItem('todo_user', JSON.stringify(res.user));
            
            // HIDE AUTH, SHOW APP
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('app-screen').classList.remove('hidden');
            
            if (typeof initApp === "function") initApp();
        } else {
            if (typeof showToast === "function") showToast(res.message || "Login Failed", "error");
        }
    } catch (err) {
        console.error("Login Error:", err);
        if (typeof showToast === "function") showToast("Server Error", "error");
    } // THIS CLOSES THE TRY/CATCH PROPERLY
};

function logout() {
    localStorage.removeItem('todo_user');
    location.reload();
}
// Check if user is already logged in when the page loads
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('todo_user');
    if (savedUser) {
        // User is logged in, skip login screen
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        if (typeof initApp === "function") initApp();
    }
});
