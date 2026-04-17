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
            
            // Save user data to browser memory
            localStorage.setItem('todo_user', JSON.stringify(res.user));
            
            // This is the part that "moves" you to the dashboard
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('register-screen').classList.add('hidden');
            document.getElementById('app-screen').classList.remove('hidden');
            
            // Initialize the app dashboard (theme, lists, etc)
            if (typeof initApp === "function") initApp();
            
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
