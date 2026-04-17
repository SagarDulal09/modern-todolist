function toggleAuth(showRegister) {
    document.getElementById('login-screen').classList.toggle('hidden', showRegister);
    document.getElementById('register-screen').classList.toggle('hidden', !showRegister);
}

// Handle Registration
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const pass = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (pass !== confirm) {
        return showToast("Passwords do not match", "error");
    }

    const user = {
        name: document.getElementById('reg-user').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        password: pass,
        id: "U" + Date.now()
    };

    showToast("Creating account...");
    const res = await apiRequest({ action: 'registerUser', user });
    if (res.success) {
        showToast("Success! Please login.");
        toggleAuth(false);
    } else {
        showToast("Registration failed.", "error");
    }
};

// Handle Login
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const loginId = document.getElementById('login-id').value;
    const loginPass = document.getElementById('login-pass').value;

    showToast("Checking credentials...");
    const res = await apiRequest({ action: 'loginUser', loginId, loginPass });

    if (res.success) {
        localStorage.setItem('todo_user', JSON.stringify(res.user));
        location.reload();
    } else {
        showToast("Invalid user or password.", "error");
    }
};

function logout() {
    localStorage.removeItem('todo_user');
    location.reload();
}
