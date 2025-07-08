# 📦 QR Scanner & Waybill Printer (Electron App)

An Electron-based desktop application for scanning QR codes and printing waybill PDFs. Built with TypeScript, Electron Forge, Webpack, and ZXing.

## ✨ Features

- 📷 Scan QR codes from webcam or uploaded images
- 🖨️ Print waybills to a selected printer
- 🔍 Search and view order details by invoice number
- ⚙️ Auto-fetch and cache available printers
- 🧩 Modular architecture using templates per screen (QR, Waybill Viewer, Config)
- 🌐 Environment-aware logic with `APP_ENV` support

---

## 🧰 Tech Stack

| Layer         | Technology            |
|---------------|------------------------|
| Runtime       | [Electron](https://www.electronjs.org/) |
| UI            | HTML, CSS, Web APIs    |
| Language      | TypeScript             |
| Bundler       | Webpack (Electron Forge Plugin) |
| QR Scanning   | [ZXing](https://github.com/zxing-js/library) |
| IPC Bridge    | `contextBridge` + Preload Script |
| Printer APIs  | Electron's native printing via Node |

---

## 📂 Folder Structure

