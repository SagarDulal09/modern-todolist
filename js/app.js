// Toggle between Login and Register
function toggleAuth(showRegister) {
    document.getElementById('login-screen').classList.toggle('hidden', showRegister);
    document.getElementById('register-screen').classList.toggle('hidden', !showRegister);
}

// Handle Login
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const loginId = document.getElementById('login-id').value;
    const loginPass = document.getElementById('login-pass').value;

    showToast("Authenticating...");
    const res = await apiRequest({ action: 'loginUser', loginId, loginPass });

    if (res.success) {
        localStorage.setItem('todo_user', JSON.stringify(res.user));
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        initApp();
    } else {
        showToast(res.message || "Invalid Credentials", "error");
    }
};

// Check for existing session on page load
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('todo_user');
    if (savedUser) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        initApp();
    }
});

// Google One-Tap Login
async function handleCredentialResponse(response) {
    try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const user = { id: payload.sub, name: payload.name, email: payload.email };
        
        const res = await apiRequest({ action: 'syncUser', user });
        if (res.success) {
            localStorage.setItem('todo_user', JSON.stringify(res.user));
            location.reload();
        }
    } catch (e) {
        console.error("Google Auth failed", e);
    }
}
