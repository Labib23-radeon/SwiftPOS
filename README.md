# SwiftPOS – Smart Retail Checkout System

A full-stack, futuristic desktop Point of Sale (POS) application built with React, Node.js, SQLite, and Electron.

## Features Added
- **Modern User Interface:** Dark/Light theme toggling, clean product layout, cart management.
- **Intelligent Barcode Scanner:** 
    - Use your smartphone as a wireless barcode scanner over your local network.
    - Scans are transmitted via WebSockets in real-time.
    - **Smart Registration:** If you scan a barcode that isn't in your database, the POS auto-prompts you to register the name, price, and stock!
- **Inventory Management:** Full view of all registered products with low-stock warnings.
- **Analytics Dashboard:** Keep track of daily revenue, total transactions, and alerts.
- **Checkout & Receipt:** Process customer payments, calculate change, and print a custom receipt natively.

## How to Run the App Easily
You can now start the entire application by simply double-clicking the **`start-swiftpos.bat`** file in the root folder, or running:
```bash
npm start
```
This single command spins up the SQLite database backend, starts the React frontend, and launches the Electron desktop app sequentially.

## How to use the Mobile Scanner (Crucial Steps)
Since the app runs locally, the scanner requires a network connection to the POS.

1. Connect your Computer and your Smartphone to the **same Wi-Fi network**.
2. Open the SwiftPOS Desktop App, and look at the Top Right corner. Click **"Connect Scanner"**.
3. A QR code will appear! Scan this QR code with your phone's default camera app, OR type the displayed URL manually into your mobile Chrome/Safari browser.
4. **Important Security Fix (Android/Chrome):** Mobile browsers block camera access on `http://` addresses for security reasons. To fix this:
   - On your phone's Chrome browser, go to `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
   - You will see a text box. Enter the URL shown on your computer screen (e.g., `http://192.168.0.x:3001`).
   - Change the dropdown next to it to **Enabled**.
   - Click the **Relaunch** button at the bottom right.
5. Your scanner should now work perfectly! Start scanning items!
