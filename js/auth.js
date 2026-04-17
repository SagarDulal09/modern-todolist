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

    showToast("Authenticating...");

    try {
        // We send 'loginUser' action to the script
        const res = await apiRequest({ 
            action: 'loginUser', 
            loginId: loginId, 
            loginPass: loginPass 
        });

if (res.success) {
    showToast("Login Successful!");
    localStorage.setItem('todo_user', JSON.stringify(res.user));
    
    // HIDE the whole auth wrapper, not just the inner screens
    document.getElementById('auth-container').classList.add('hidden'); 
    
    // SHOW the dashboard
    document.getElementById('app-screen').classList.remove('hidden');
    
    if (typeof initApp === "function") initApp();
}
            
        } else {
            showToast(res.message || "Invalid Email or Password", "error");
        }
    } catch (err) {
        showToast("Connection error. Try again.", "error");
        console.error(err);
    }
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
