import { PrintOption } from "./constants/print-option";
import { Printer } from "./models/printer";
import { QR } from "./models/qr";

export { };

/**
 * Extends the global `window` object to include custom APIs exposed via Electron's preload script.
 * 
 * This allows TypeScript to recognize additional properties or methods that are injected into the
 * renderer process from the main/preload context using `contextBridge.exposeInMainWorld`.
 *
 * By declaring these properties globally, we enable full type safety and autocompletion support
 * when accessing native or backend-integrated functionality from the frontend.
 */
declare global {
  interface Window {
    waybill: {
      getPrinters: () => Promise<Printer[]>,
      printPdf: (url: QR, printerName: string, printOption: PrintOption, manualLookup?: boolean) => Promise<string>,
      getItems: (data: QR, manualLookup?: boolean) => Promise<object>
    };
  }
}
