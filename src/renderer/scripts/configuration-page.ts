import { Printer } from 'pdf-to-printer/dist';
import { initLandingPage } from './landing-page';
import { registerPage, renderPage } from './render-page';
let cachedPrinters: Printer[] = [];
export let selectedPrinter: string | null = null;

export const initConfigurationPage = () => {
    /**
     * Immediately invoked async function to:
     * - Fetch the list of available printers via `window.printer.getPrinters()`
     * - Populate the <select> dropdown with printer options
     */
    const fetchPrinters = async (isRefresh: boolean = false) => {
        const printerDropdown = document.getElementById('printerList');
        printerDropdown.innerHTML = '';

        if (cachedPrinters.length === 0 || isRefresh === true) {
            try {
                cachedPrinters = await window.waybill.getPrinters();
            } catch (error) {
                const errorOption = document.createElement('option');
                errorOption.textContent = 'Error fetching printers...';
                errorOption.disabled = true;
                errorOption.selected = true;
                printerDropdown.appendChild(errorOption);
            }
        }

        printerDropdown.innerHTML = '';

        if (cachedPrinters.length === 0) {
            const noPrinterOption = document.createElement('option');
            noPrinterOption.textContent = 'No printers found';
            noPrinterOption.disabled = true;
            noPrinterOption.selected = true;
            printerDropdown.appendChild(noPrinterOption);
            return;
        }

        const placeholderOption = document.createElement('option');
        placeholderOption.textContent = 'Select a printer...';
        placeholderOption.disabled = true;
        placeholderOption.selected = !selectedPrinter;
        placeholderOption.hidden = true;
        printerDropdown.appendChild(placeholderOption);

        cachedPrinters.map((printers: Printer) => {
            const option = document.createElement('option');
            option.dataset.printerId = printers.deviceId;
            option.textContent = `${printers.name}`;

            if (printers.name === selectedPrinter) {
                option.selected = true;
            }

            printerDropdown.appendChild(option);
        })
    }

    fetchPrinters();

    /* Refresh printer list */
    document.getElementById('refresh-printer').addEventListener('click', async () => {
        await fetchPrinters(true);
    })

    const printerDropdown = document.getElementById('printerList') as HTMLSelectElement;

    printerDropdown.addEventListener('change', (event) => {
        const target = event.target as HTMLSelectElement;
        const printerValue = target.value;
        if (printerValue) {
            selectedPrinter = printerValue;
        }
    })

    document.getElementById('home-button')?.addEventListener('click', () => {
        renderPage('landing-page');
    });

    /**
     * This block is intentionally commented out because the current implementation
     * does not require a manual "Print" button — printing is handled automatically after QR scanning.
     */
    // document.getElementById('printBtn').addEventListener('click', async () => {
    //     const pdfUrlElement = document.getElementById('pdfUrl') as HTMLInputElement;
    //     const value = pdfUrlElement.value.trim();
    //     const printButton = document.getElementById('printBtn') as HTMLButtonElement;
    //     const printerElement = document.getElementById('printerList') as HTMLSelectElement
    //     printButton.disabled = true
    //     try {
    //         const res = await window.waybill.printPdf(value, printerElement.value
    //         );
    //         alert(res);
    //     } catch (error) {
    //         alert(error);
    //     } finally {
    //         printButton.disabled = false
    //     }
    // });
}

registerPage('config-page', {
    init: initConfigurationPage
})


