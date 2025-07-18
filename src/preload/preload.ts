// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { PrintOption } from "src/constants/print-option";
import { Printer } from "src/models/printer";
import { QR } from "src/models/qr";

contextBridge.exposeInMainWorld('waybill', {
    getPrinters: (): Promise<Printer[]> => ipcRenderer.invoke('get-printers'),
    printPdf: (data: QR, printerName: string | null, printOption: PrintOption, manualLookup?: boolean): Promise<string> => ipcRenderer.invoke('print', data, printerName, printOption, manualLookup),
    getItems: (data: QR, manualLookup?: boolean): Promise<object> => ipcRenderer.invoke('getItems', data, manualLookup),
    setPrinter: (printerName: string): Promise<string> => ipcRenderer.invoke('setPrinter', printerName),
    // Get default printer from storage (Different from default printer of OS)
    getConfigDefaultPrinter: (): Promise<Printer | null> => ipcRenderer.invoke('getConfigDefaultPrinter')
});