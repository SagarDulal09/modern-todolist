/**
 * TASKFLOW PRO - CORE API ENGINE
 * Architected by Sagar Dulal | © 2026
 * Protocol: Secure Google Apps Script Web App (GAS)
 */

const API_CONFIG = {
    // ⚠️ CRITICAL: Replace with your deployed Web App URL from Google Apps Script
    URL: "https://script.google.com/macros/s/AKfycbxBnJA-bySZumgVenlMExqcVZUsUSdo3Efxywx_lHL6pFeNXQ6Uxg4bUz2fwKYw9ohJaw/exec", 
    TIMEOUT_MS: 30000, // 30s timeout for stability in low-bandwidth areas
    RETRIES: 2
};

/**
 * Primary Communication Gateway
 * @param {Object} payload - The action and data being sent to the cloud.
 */
async function apiRequest(payload) {
    APILoader.show();
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

        const response = await fetch(API_CONFIG.URL, {
            method: 'POST',
            mode: 'cors', // Cross-Origin Resource Sharing enabled
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', 
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Logical Gatekeeper
        if (!data.success && data.message) {
            console.warn("System Response Warning:", data.message);
        }

        return data;

    } catch (error) {
        console.error("NODE CONNECTION FAILURE:", error);
        
        let errorMsg = "Network Unstable. Checking Connection...";
        if (error.name === 'AbortError') errorMsg = "Request Timed Out. Retrying...";
        
        showToast(errorMsg);
        return { success: false, message: errorMsg };
    } finally {
        APILoader.hide();
    }
}

/**
 * UI Sync Components
 */
const APILoader = {
    show: () => {
        if (document.getElementById('api-global-loader')) return;
        
        const loader = document.createElement('div');
        loader.id = 'api-global-loader';
        loader.className = 'fixed inset-0 z-[11000] flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md transition-opacity duration-300';
        loader.innerHTML = `
            <div class="glass-panel p-10 rounded-[2.5rem] flex flex-col items-center gap-6 border border-indigo-500/30">
                <div class="relative">
                    <i class="fas fa-satellite-dish text-indigo-500 text-3xl animate-pulse"></i>
                    <div class="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-[10px] font-black uppercase tracking-[0.4em] text-white">Syncing Node</span>
                    <span class="text-[8px] font-bold text-slate-400 uppercase mt-2">Connecting to Secure Cloud</span>
                </div>
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
 * Data Sanitizer for Task Submissions
 * Ensures all session times and dates are formatted for the Spreadsheet.
 */
const DataSanitizer = {
    formatTask: (taskData) => {
        return {
            ...taskData,
            timestamp: new Date().toISOString(),
            deviceInfo: navigator.userAgent.substring(0, 100),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
};

// Auto-check for API URL configuration
if (API_CONFIG.URL === "YOUR_GOOGLE_SCRIPT_WEB_APP_URL") {
    console.error("TASKFLOW PRO: API URL NOT CONFIGURED. Backend sync will fail.");
}
