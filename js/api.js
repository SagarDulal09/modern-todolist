/**
 * TaskFlow API Handler - Developed by Sagar Dulal
 * Handles all backend communication with Google Sheets
 */

// Your Specific Deployment URL (Verified for Sagar Dulal)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxBnJA-bySZumgVenlMExqcVZUsUSdo3Efxywx_lHL6pFeNXQ6Uxg4bUz2fwKYw9ohJaw/exec";

/**
 * Global API Request Wrapper
 * @param {Object} data - The payload containing the action and parameters
 * @returns {Promise<Object>} - Standardized JSON response
 */
async function apiRequest(data) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "cors", 
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const result = await response.json();
        
        // Debugging Log (Can be disabled for production)
        console.log(`[API] Action: ${data.action} | Status: Success`);
        
        return result;

    } catch (error) {
        console.error("Critical API Failure:", error);
        
        // Ensure the UI knows the request failed without crashing
        return { 
            success: false, 
            message: "Connection Error: Check internet or Script URL." 
        };
    }
}

/**
 * Developer Credit Console Log
 */
console.log("%cTaskFlow Dashboard", "color: #6366f1; font-size: 20px; font-weight: bold;");
console.log("%cDeveloped by Sagar Dulal | © 2026", "color: #64748b; font-size: 12px;");
