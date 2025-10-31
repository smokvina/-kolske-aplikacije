// IMPORTANT: This URL is a placeholder.
// To make this work, you must:
// 1. Open the Google Sheet: https://docs.google.com/spreadsheets/d/1WEe2msu4ivar8wQqpU0H7CxLKE7liqaBh4_6JnmxvsQ/
// 2. Go to Extensions > Apps Script.
// 3. Paste the Apps Script code (provided at the bottom of this file) into the editor, replacing any existing code.
// 4. Follow the NEW, detailed deployment instructions in the comment block at the bottom of this file.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzRZhzHE7O3v3qgbpn-oGffTYfW-cbjOYKxU9M3FfkkeSdq1IDkYsG3juZyd-7QJ7FpVQ/exec'; // IMPORTANT: Replace with your actual deployed script URL!

/**
 * Logs a chat message to the Google Sheet via a Google Apps Script Web App.
 * @param sender - Who sent the message ('user' or 'bot').
 * @param text - The content of the message.
 */
export const logChatMessage = async (sender: 'user' | 'bot', text: string): Promise<void> => {
  if (SCRIPT_URL.includes('...')) {
    console.warn('Google Sheets logging is not configured. Please set the SCRIPT_URL in services/googleSheetsService.ts with your deployed Apps Script URL.');
    return;
  }

  const formData = new FormData();
  formData.append('action', 'logChat');
  formData.append('timestamp', new Date().toISOString());
  formData.append('sender', sender);
  formData.append('text', text);

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData,
      // No 'mode: cors' needed here, as the script handles it
    });
    if (!response.ok) {
       console.error('Failed to log chat message. Server responded with status:', response.status);
    }
  } catch (error) {
    console.error('Error while sending chat log to Google Sheet. This is often a CORS or Google Apps Script deployment issue. Please ensure you have deployed the script correctly with "Who has access" set to "Anyone".', error);
  }
};

/**
 * Logs a submitted report to the Google Sheet via a Google Apps Script Web App.
 * @param category - The selected category for the report.
 * @param description - The user-provided description.
 * @param hasImage - Whether an image was attached.
 */
export const logReport = async (category: string, description: string, hasImage: boolean): Promise<void> => {
  if (SCRIPT_URL.includes('...')) {
    console.warn('Google Sheets logging is not configured. Please set the SCRIPT_URL in services/googleSheetsService.ts with your deployed Apps Script URL.');
    return;
  }
  
  const formData = new FormData();
  formData.append('action', 'logReport');
  formData.append('timestamp', new Date().toISOString());
  formData.append('category', category);
  formData.append('description', description);
  formData.append('hasImage', String(hasImage));

  try {
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
       console.error('Failed to log report. Server responded with status:', response.status);
    }
  } catch (error) {
    console.error('Error while sending report log to Google Sheet. This is often a CORS or Google Apps Script deployment issue. Please ensure you have deployed the script correctly with "Who has access" set to "Anyone".', error);
  }
};


/*
  --- GOOGLE APPS SCRIPT CODE (for setup) ---
  --- Paste this code into Extensions > Apps Script in your Google Sheet ---

  // ============================================================================================
  //  VERY IMPORTANT: SETUP INSTRUCTIONS (UPDATED)
  // ============================================================================================
  // To fix the "Failed to fetch" (CORS) error, you MUST deploy this script correctly.
  // Follow these steps exactly:
  //
  // 1. OPEN SCRIPT EDITOR:
  //    In your Google Sheet, go to "Extensions" -> "Apps Script".
  //
  // 2. REPLACE CODE:
  //    Delete all existing code in the editor and paste this entire script.
  //
  // 3. SAVE THE SCRIPT:
  //    Click the floppy disk icon (Save project).
  //
  // --- A) If this is your FIRST time deploying: ---
  //
  // 4. CREATE A NEW DEPLOYMENT:
  //    - Click the blue "Deploy" button -> "New deployment".
  //
  // 5. CONFIGURE THE WEB APP:
  //    - Click the gear icon next to "Select type" and choose "Web app".
  //    - For "Who has access", you MUST select "Anyone". THIS IS THE MOST IMPORTANT STEP.
  //
  // 6. DEPLOY & AUTHORIZE:
  //    - Click "Deploy".
  //    - Click "Authorize access" and follow the prompts to allow the script to run.
  //      (You may need to click "Advanced" -> "Go to... (unsafe)"). This is normal.
  //
  // 7. COPY THE URL:
  //    - Copy the final "Web app URL".
  //
  // --- B) If you are UPDATING an existing deployment: ---
  //
  // 4. MANAGE DEPLOYMENTS:
  //    - Click the blue "Deploy" button -> "Manage deployments".
  //
  // 5. EDIT THE DEPLOYMENT:
  //    - Find your active deployment in the list and click the pencil icon (Edit).
  //
  // 6. CREATE A NEW VERSION:
  //    - From the "Version" dropdown, select "New version". THIS IS A CRITICAL STEP.
  //    - You do NOT need to change the "Who has access" setting if it's already "Anyone".
  //
  // 7. DEPLOY:
  //    - Click "Deploy". The URL should stay the same.
  //
  // 8. UPDATE CLIENT-SIDE CODE:
  //    - Paste the copied URL into the `SCRIPT_URL` constant at the top of this file.
  // ============================================================================================


  // Handles CORS preflight requests from browsers. This is essential to prevent "Failed to fetch" errors.
  function doOptions(e) {
    return ContentService.createTextOutput()
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  function doPost(e) {
    try {
      var sheetId = '1WEe2msu4ivar8wQqpU0H7CxLKE7liqaBh4_6JnmxvsQ';
      var spreadsheet = SpreadsheetApp.openById(sheetId);
      var params = e.parameter;
      var action = params.action;

      if (action === 'logChat') {
        var chatSheet = spreadsheet.getSheetByName('ChatLogs');
        if (!chatSheet) {
          chatSheet = spreadsheet.insertSheet('ChatLogs');
          chatSheet.appendRow(['Timestamp', 'Sender', 'Message']);
        }
        chatSheet.appendRow([params.timestamp, params.sender, params.text]);

      } else if (action === 'logReport') {
        var reportSheet = spreadsheet.getSheetByName('Prijave');
        if (!reportSheet) {
          reportSheet = spreadsheet.insertSheet('Prijave');
          reportSheet.appendRow(['Timestamp', 'Category', 'Description', 'Has Image']);
        }
        reportSheet.appendRow([params.timestamp, params.category, params.description, params.hasImage]);

      } else {
        throw new Error("Invalid action parameter provided.");
      }
      
      return ContentService.createTextOutput(JSON.stringify({ 'status': 'success', 'action': action }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');

    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({ 'status': 'error', 'message': error.message }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }
  }
*/