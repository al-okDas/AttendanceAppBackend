// File: app.js

const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env
dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));


const port = process.env.PORT || 3000;

const SPREADSHEET_ID = process.env.PORT; // Add Spreadsheet ID in .env file
const SERVICE_ACCOUNT_KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE; // Path to service account key
// const serviceAccountKey = JSON.parse(serviceJSON);
// Set up the Google Sheets API client
async function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: SERVICE_ACCOUNT_KEY_FILE, 
        // credentials: serviceJSON,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'], // Read-only access
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
}

// Fetch data from Google Sheets
async function fetchSheetData() {
    const sheets = await getGoogleSheetsClient();

    const range = 'attendance_sheet!A1:D'; // Modify the range as per your sheet

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
    });

    return response.data.values;
}

function convertToObjects(arr) {
    const headers = arr[0]; // Get the first row (headers)
    const dataRows = arr.slice(1); // Get the remaining rows (data)

    return dataRows.map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index]; // Assign values to keys
        });
        return obj;
    });
}

// API Route to get data from Google Sheets
app.get('/sheets-data', async (req, res) => {
    try {
        const data = await fetchSheetData();
        const finalData = convertToObjects(data);
        res.status(200).json(finalData);
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
        res.status(500).json({ error: 'Failed to fetch data from Google Sheets' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
