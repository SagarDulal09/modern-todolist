/**
 * TASKFLOW PRO - CORE API ENGINE
 * Developed by Sagar Dulal | © 2026
 * Description: Interface between Frontend Logic and Google Apps Script Cloud.
 */

// 1. CONFIGURATION - SAGAR: PASTE YOUR DEPLOYED WEB APP URL HERE
const API_CONFIG = {
    URL: "YOUR_GOOGLE_SCRIPT_WEB_APP_URL", // Update this after deploying Code.gs
    TIMEOUT: 15000,
    VERSION: "2.1.0-Enterprise"
};

/**
 * MASTER COMMUNICATION HANDLER
 * Uses the Fetch API with optimized JSON headers
 */
async function apiRequest(payload) {
    try {
        // Human-Touch: Add a micro-delay for "Processing" feel if on high-speed internet
        const startTime = Date.now();

        const response = await fetch(API_CONFIG.URL, {
            method: 'POST',
            mode: 'no-cors', // Essential for Google Apps Script Web App calls
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        /**
         * NOTE: Because 'no-cors' mode is used for GAS, we cannot read the 
         * response body directly in standard browser fetches. 
         * We rely on a "Hidden JSONP" or "Success-Mirror" strategy.
         */
        
        // For Google Apps Script specifically, we usually handle the response 
        // via a redirect or a standard JSON return if CORS is enabled on the GAS side.
        // Below is the standardized handling:

        const result = await fetch(API_CONFIG.URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        return await result.json();

    } catch (error) {
        console.error("%c API ERROR ", "background: #ef4444; color: #fff;", error);
        return { success: false, message: "Cloud Connection Interrupted." };
    }
}

/**
 * THE API LOADER OVERLAY (GLOBAL)
 */
const APILoader = {
    show: () => {
        const loader = document.createElement('div');
        loader.id = 'api-global-loader';
        loader.className = 'fixed inset-0 z-[11000] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300';
        loader.innerHTML = `
            <div class="glass-panel p-8 rounded-[2rem] flex flex-col items-center gap-4 animate-pulse">
                <i class="fas fa-satellite-dish text-indigo-500 text-2xl animate-bounce"></i>
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-white">Syncing with Node...</span>
            </div>
        `;
        document.body.appendChild(loader);
    },
    hide: () => {
        const loader = document.getElementById('api-global-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }
};

/**
 * EXTENDED API ACTIONS MAPPING
 * Reference this for implementing new features
 */
const API_ACTIONS = {
    // Auth & Security
    SEND_OTP: 'sendOTP',           // Dispatches 6-digit code via MailApp
    VERIFY_OTP: 'validateOTP',     // Validates code + 5-minute expiry
    REGISTER: 'registerUser',      // Finalizes verified profile
    LOGIN: 'loginUser',            // Validates credentials
    
    // Task Architecture
    ADD_TASK: 'addTask',           // Now includes Start Date, End Date, Dual Sessions
    GET_TASKS: 'getTasks',         // Fetches specific List Cluster
    UPDATE_STATUS: 'updateTaskStatus', 
    ARCHIVE_TASK: 'deleteTask',    // Soft-delete with mandatory Reason
    
    // Project Clusters
    ADD_LIST: 'addList',
    GET_LISTS: 'getLists'
};

// Console Branding for Debugging
console.log(`%c TaskFlow Pro API Connected | Version ${API_CONFIG.VERSION} `, "color: #6366f1; font-weight: bold; border: 1px solid #6366f1; padding: 4px; border-radius: 4px;");
