# UPES Portal Integration Guide

This guide explains how to use the UPES portal connector with your Student Gateway.

## Portal Information

- **Portal URL**: https://myupes-beta.upes.ac.in/
- **Portal Type**: UPES (University of Petroleum and Energy Studies)

## Setting Up UPES Connection

### Step 1: Connect Your Portal

1. Log in to the Student Gateway
2. Click "Connect Portal"
3. Select "UPES (University of Petroleum and Energy Studies)" from the dropdown
4. The portal URL will be auto-filled: `https://myupes-beta.upes.ac.in/`
5. Enter your UPES student ID/username
6. Enter your password
7. Click "Connect Portal"

### Step 2: First Sync

After connecting, click "Sync Now" to fetch your portal data. The system will:
- Log in to your UPES portal
- Extract attendance information
- Fetch exam schedules
- Get fee details
- Retrieve notices and announcements
- Download results (if available)

## Available Actions

The UPES connector supports the following actions:

### 1. Apply for Exam
- Automatically fills and submits exam application forms
- Selects available exam slots
- Confirms submission

### 2. Download Admit Card
- Locates and downloads your admit card
- Saves it to your device

### 3. Download Results
- Fetches and downloads result sheets
- Available for completed exams

### 4. Pay Fees
- Redirects to payment portal
- Initiates fee payment process

### 5. Download Fee Receipt
- Downloads payment receipts
- Available after successful payment

### 6. Apply for Leave
- Fills leave application form
- Submits with reason and date

## How It Works

The UPES connector uses intelligent element detection:

1. **Login**: Automatically detects username/password fields using multiple selector strategies
2. **Navigation**: Finds dashboard and menu items
3. **Data Extraction**: Uses pattern matching to extract:
   - Attendance percentages
   - Exam dates and subjects
   - Fee amounts
   - Notice titles and content
   - Result grades and marks

## Troubleshooting

### Login Fails

If login fails, check:
1. Your credentials are correct
2. The portal URL is accessible
3. Your account is not locked
4. Check the browser console for error screenshots (saved as `upes-login-error.png`)

### Data Not Appearing

If data doesn't appear after sync:
1. The portal structure may have changed
2. Some sections may require additional navigation
3. Try syncing again after a few minutes
4. Check if you're logged in correctly

### Actions Not Working

If actions fail:
1. The portal may have updated its interface
2. Some actions may require manual verification
3. Check the action result message for details
4. Try the action directly on the portal to verify it's available

## Customization

The UPES connector is designed to be flexible. If the portal structure changes:

1. **Update Selectors**: Edit `backend/src/automation/connectors/upes.connector.ts`
2. **Add New Actions**: Extend the `performAction` method
3. **Improve Data Extraction**: Enhance the `scrapeData` method

## Security Notes

- Your credentials are encrypted with AES-256-GCM
- Passwords are never stored in plaintext
- Only the automation bot accesses your portal
- Screenshots are taken for verification but not stored permanently

## Support

If you encounter issues:
1. Check the backend logs for detailed error messages
2. Review the browser automation screenshots
3. Verify portal accessibility
4. Ensure your account has necessary permissions

## Future Enhancements

Planned improvements:
- Real-time portal change notifications
- Automated attendance tracking
- Exam reminder system
- Fee payment automation
- Grade analysis and trends
