/**
 * TaskFlow API Handler
 * Connects the frontend to the Google Apps Script Backend
 */

// Your Specific Deployment URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxBnJA-bySZumgVenlMExqcVZUsUSdo3Efxywx_lHL6pFeNXQ6Uxg4bUz2fwKYw9ohJaw/exec";

/**
 * Global function to handle all communication with Google Sheets
 * @param {Object} data - The payload containing the 'action' and required fields
 * @returns {Promise<Object>} - The JSON response from the server
 */
async function apiRequest(data) {
    try {
        // We use 'no-cors' mode only if necessary, but Google Apps Script 
        // usually requires a standard POST for JSON exchange.
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "cors", // Ensures we can read the JSON response
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Log for debugging (you can remove this in production)
        console.log(`API Response [${data.action}]:`, result);
        
        return result;

    } catch (error) {
        console.error("Critical API Error:", error);
        
        // Return a consistent error object so the UI doesn't crash
        return { 
            success: false, 
            message: "Connection failed. Please check your internet or Script URL." 
        };
    }
}

/**
 * Example Usage:
 * const response = await apiRequest({ action: 'getLists', userId: '123' });
 */
