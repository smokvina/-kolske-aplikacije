// IMPORTANT: This URL is a placeholder.
// To make this work, you must:
// 1. Open the Google Sheet: https://docs.google.com/spreadsheets/d/1WEe2msu4ivar8wQqpU0H7CxLKE7liqaBh4_6JnmxvsQ/
// 2. Go to Extensions > Apps Script.
// 3. Paste the Apps Script code (provided at the bottom of this file) into the editor, replacing any existing code.
// 4. Click "Deploy" > "New deployment".
// 5. For "Select type", choose "Web app".
// 6. In the configuration, set "Who has access" to "Anyone".
// 7. Click "Deploy".
// 8. Authorize the script with your Google account when prompted.
// 9. Copy the generated "Web app URL" and paste it into the SCRIPT_URL constant below.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyosqlm4qwr8cZkw4SDrpj60qKmNYMQydFpgGx1l9MtAX5LIwvpPuz6iqOeG7Rtq1RaoQ/exec'; // IMPORTANT: Replace with your actual deployed script URL!

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
    });
    if (!response.ok) {
       console.error('Failed to log chat message. Server responded with status:', response.status);
    }
  } catch (error) {
    console.error('Error while sending chat log to Google Sheet:', error);
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
    console.error('Error while sending report log to Google Sheet:', error);
  }
};


/*
  --- GOOGLE APPS SCRIPT CODE (for setup) ---
  --- Paste this code into Extensions > Apps Script in your Google Sheet ---

  function doPost(e) {
    try {
      // Use the ID of the specific spreadsheet you want to write to.
      var sheetId = '1WEe2msu4ivar8wQqpU0H7CxLKE7liqaBh4_6JnmxvsQ';
      var spreadsheet = SpreadsheetApp.openById(sheetId);
      var params = e.parameter;
      var action = params.action;

      if (action === 'logChat') {
        var chatSheet = spreadsheet.getSheetByName('ChatLogs');
        if (!chatSheet) {
          chatSheet = spreadsheet.insertSheet('ChatLogs');
          // Set headers if the sheet is new
          chatSheet.appendRow(['Timestamp', 'Sender', 'Message']);
        }
        // Append the new chat message
        chatSheet.appendRow([params.timestamp, params.sender, params.text]);

      } else if (action === 'logReport') {
        var reportSheet = spreadsheet.getSheetByName('Prijave');
        if (!reportSheet) {
          reportSheet = spreadsheet.insertSheet('Prijave');
          // Set headers if the sheet is new
          reportSheet.appendRow(['Timestamp', 'Category', 'Description', 'Has Image']);
        }
        // Append the new report
        reportSheet.appendRow([params.timestamp, params.category, params.description, params.hasImage]);

      } else {
        // Handle unknown actions
        throw new Error("Invalid action parameter provided.");
      }
      
      // Return a success response
      return ContentService.createTextOutput(JSON.stringify({ 'status': 'success', 'action': action }))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      // Return an error response
      return ContentService.createTextOutput(JSON.stringify({ 'status': 'error', 'message': error.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
*/