/**
 * Project: TaskFlow Pro
 * Developer: Sagar Dulal
 * Copyright: © 2026 Sagar Dulal
 * Purpose: Authentication, OTP Logic, and Session Management
 */

const AuthSystem = {
    currentUser: null,

    init() {
        this.checkSession();
        this.bindEvents();
    },

    /**
     * Check if user is already logged in via LocalStorage
     */
    checkSession() {
        const savedUser = localStorage.getItem('tfp_session');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            console.log("Session Restored: " + this.currentUser.full_name);
        } else {
            // In a real app, redirect to login.html if not on it
            // window.location.href = 'login.html';
        }
    },

    /**
     * Logic for OTP Generation (Syncs with OTP_LOG sheet)
     */
    async sendOTP(email) {
        const otpCode = Math.floor(100000 + Math.random() * 900000); // 6 Digit OTP
        
        const payload = {
            email: email,
            otp_code: otpCode,
            timestamp: new Date().toISOString()
        };

        showSystemAlert("OTP Sent", `Verification code dispatched to ${email}`, "success");
        
        // Push to OTP_LOG sheet via API
        if (typeof API !== 'undefined') {
            return await API.request('logOTP', payload);
        }
        return otpCode; 
    },

    /**
     * Handle User Registration
     * Matches Users Sheet: user_id, full_name, email, phone, password, created_at, last_login
     */
    async registerUser(formData) {
        const userId = `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const userData = {
            user_id: userId,
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            password: btoa(formData.password), // Basic Base64 encoding for demo
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
        };

        showSystemAlert("Account Created", "Welcome to TaskFlow Pro, " + formData.fullName, "success");
        
        // Log to System_Logs
        if (typeof API !== 'undefined') {
            await API.request('insertUser', userData);
            await API.logSystemEvent(userId, "ACCOUNT_CREATION");
        }

        return userData;
    },

    /**
     * Handle User Login
     */
    async login(email, password) {
        // Logic to verify against Users sheet would go here
        // For now, we simulate a successful login
        const mockUser = {
            full_name: "Sagar Dulal",
            email: email,
            role: "Developer"
        };

        this.currentUser = mockUser;
        localStorage.setItem('tfp_session', JSON.stringify(mockUser));
        
        if (typeof API !== 'undefined') {
            await API.logSystemEvent(email, "LOGIN_SUCCESS");
        }

        location.reload(); // Refresh to update UI with user context
    },

    /**
     * Terminate Session
     */
    logout() {
        localStorage.removeItem('tfp_session');
        showSystemAlert("Session Terminated", "Security protocols engaged. Logged out.", "info");
        setTimeout(() => {
            location.reload();
        }, 1500);
    },

    bindEvents() {
        // Example binding for a logout button if it exists
        const logoutBtn = document.getElementById('terminate-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }
};

// Global logout function used in index.html
function authLogout() {
    AuthSystem.logout();
}

// Initialize Auth
document.addEventListener('DOMContentLoaded', () => AuthSystem.init());
