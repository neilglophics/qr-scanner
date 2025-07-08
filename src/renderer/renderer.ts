import './index.css';
import { Printer } from 'src/models/printer';
import { BrowserQRCodeReader } from '@zxing/browser';
import { PrintOption } from 'src/constants/print-option';
import closeImage from '../assets/close_icon.png';
import printImage from '../assets/print.png';
import compLogo from '../assets/logo.png'
import { QR } from 'src/models/qr';
import { WaybillItem } from 'src/models/item';
import { Order } from 'src/models/order';
import infoImage from '../assets/Info.png';
let cachedPrinters: Printer[] = [];

const initQrPage = () => {
    function showToast(message: string, type = 'sucess', duration = 6000) {
        const toast = document.getElementById('toast')!;
        toast.textContent = message;
        toast.style.display = 'block';

        if (type === 'error') {
            toast.style.backgroundColor = '#D32F2F';
        } else {
            toast.style.backgroundColor = '#323232';
        }

        setTimeout(() => {
            toast.style.display = 'none';
            toast.textContent = '';
        }, duration);
    }


    /* Topbar Script */
    const input = document.getElementById('waybill-input') as HTMLInputElement;
    const clearBtn = document.getElementById('clear-button');
    const viewButton = document.getElementById('view-waybill') as HTMLButtonElement;
    const printWayBill = document.getElementById('print-waybill') as HTMLButtonElement;
    const errorMessage = document.getElementById('error-message') as HTMLDivElement;
    const printModal = document.getElementById('modal-overlay') as HTMLDivElement;
    const waybillSection = document.getElementById('waybill-content') as HTMLDivElement;
    const loadingModal = document.getElementById('loading-modal') as HTMLDivElement;

    input.addEventListener('input', () => {
        clearBtn.style.display = input.value ? 'block' : 'none';
        viewButton.style.opacity = input.value ? '100' : '0.5';
        viewButton.disabled = false;
        printWayBill.style.opacity = input.value ? '100' : '0.5';
        printWayBill.disabled = false;
    });

    printWayBill.addEventListener('click', async () => {
        const waybillInput = document.getElementById('waybill-input') as HTMLInputElement;

        if (waybillInput.value === '') {
            showToast('Invoice number should not be empty', 'error')
        }

        const data: QR = {
            invoice_no: waybillInput.value,
        }

        try {
            // Start both async calls in parallel
            const getItemsPromise = window.waybill.getItems(data, true);
            const printPromise = window.waybill.printPdf(data, 'Brother DCP-T500W', 'waybill' as PrintOption, true);

            // Await getItems and check result
            const res: any = await getItemsPromise;
            console.log(res)
            if (res.status !== 'SUCCESS') {
                showToast(res.error, 'error');
                return;
            }

            loadingModal.style.display = 'none'
            waybillSection.style.display = 'flex';
            artworkRow.innerHTML = '';
            printModal.style.display = 'flex';
            document.getElementById('waybill-no')!.textContent = `You are printing Waybill No. ${data.invoice_no}.`;

            const order: Order = res.response.data.order;
            document.getElementById('kinds')!.textContent = `${order.total} kinds`;
            document.getElementById('user-header')!.textContent = order.full_name;
            document.getElementById('user-fullname')!.textContent = order.full_name;
            document.getElementById('user-email')!.textContent = order.email;

            res.response.data.items.forEach((item: WaybillItem) => {
                artworkRow.appendChild(createArtworkCard(item));
            });

            // Now handle print result
            const printRes: any = await printPromise;
            if (printRes.status === 'ERROR') {
                console.error('Print failed:', printRes.error);
                printModal.style.display = 'none';
                showToast('Printing failed: ' + String(printRes.error), 'error');
            } else {
                printModal.style.display = 'none';
            }

        }
        catch (error) {
            showToast(String(error), 'error');
        }
    })

    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loadingModal.style.display = 'flex'
            const value = input.value.trim()

            if (value === '') {
                showToast('Invoice number should not be empty', 'error')
            }

            const data: QR = {
                invoice_no: value,
            }

            try {
                // Start both async calls in parallel
                const getItemsPromise = window.waybill.getItems(data, true);
                const printPromise = window.waybill.printPdf(data, 'Brother DCP-T500W', 'waybill' as PrintOption, true);

                // Await getItems and check result
                const res: any = await getItemsPromise;
                console.log(res)
                if (res.status !== 'SUCCESS') {
                    loadingModal.style.display = 'none'
                    showToast(res.error, 'error');
                    return;
                }

                loadingModal.style.display = 'none'
                waybillSection.style.display = 'flex';
                artworkRow.innerHTML = '';
                printModal.style.display = 'flex';
                document.getElementById('waybill-no')!.textContent = `You are printing Waybill No. ${data.invoice_no}.`;

                const order: Order = res.response.data.order;
                document.getElementById('kinds')!.textContent = `${order.total} kinds`;
                document.getElementById('user-header')!.textContent = order.full_name;
                document.getElementById('user-fullname')!.textContent = order.full_name;
                document.getElementById('user-email')!.textContent = order.email;

                res.response.data.items.forEach((item: WaybillItem) => {
                    artworkRow.appendChild(createArtworkCard(item));
                });

                // Now handle print result
                const printRes: any = await printPromise;
                if (printRes.status === 'ERROR') {
                    console.error('Print failed:', printRes.error);
                    printModal.style.display = 'none';
                    showToast('Printing failed: ' + String(printRes.error), 'error');
                } else {
                    printModal.style.display = 'none';
                }

            }
            catch (error) {
                showToast(String(error), 'error');
            }
        }
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        viewButton.style.opacity = '0.5';
        viewButton.disabled = true;
        printWayBill.style.opacity = '0.5';
        printWayBill.disabled = true;
        input.focus();
    });

    // viewButton.addEventListener('click', () => {
    //     errorMessage.style.display = 'flex';
    // });

    // printWayBill.addEventListener('click', () => {
    //     printModal.style.display = 'flex';
    //     waybillSection.style.display = 'flex';
    // });

    /* Error Message Script */
    const img = document.createElement('img');
    img.src = infoImage;
    img.alt = 'Info';
    img.style.width = '50px';
    document.getElementById('error-message')?.prepend(img);

    /* Artwork Items script */
    const artworkRow = document.getElementById('artwork-row') as HTMLElement;

    // Dynamically generates a single artwork card element for a given user/item.
    // Each card includes:
    // - An image inside a styled container
    // - A size label overlaid on the image (e.g., "80x80mm")
    // - A descriptive text section (e.g., sticker type or material)
    // - A footer section showing quantity (e.g., "500 pcs")
    // This function returns a complete <div class="card"> DOM element
    // which can be appended to a parent container such as <div id="artwork-row">.
    const createArtworkCard = (waybillItem: WaybillItem): HTMLDivElement => {
        const card = document.createElement('div');
        card.className = 'card';

        // Image container section
        const imageSection = document.createElement('div');
        imageSection.className = 'image_container';

        const img = document.createElement('img');
        img.src = waybillItem.thumbnail;
        img.alt = 'Artwork';
        img.style.width = '85%';

        const sizeBlock = document.createElement('div');
        sizeBlock.className = 'size_block';

        if (waybillItem.product_name !== 'Sample Pack') {
            const size = document.createElement('p');
            size.textContent = `${waybillItem.size}mm`;
            sizeBlock.appendChild(size);
            imageSection.appendChild(sizeBlock);
        }

        imageSection.appendChild(img);
        card.appendChild(imageSection);

        // Description text
        const name = document.createElement('p');
        name.className = 'card_description';
        if (waybillItem.product_name === 'Sample Pack') {
            name.textContent = `${waybillItem.product_name}`;
        } else {
            name.textContent = `${waybillItem.product_name} / ${waybillItem.supply} / ${waybillItem.finishing}`;
        }
        card.appendChild(name);

        // Footer / quantity text
        const footerSection = document.createElement('p');
        footerSection.className = 'card_footer';
        footerSection.textContent = `${waybillItem.quantity} pcs`;
        card.appendChild(footerSection);

        return card;
    };


    /* Modal Script */
    const closeElement = document.createElement('img') as HTMLImageElement;
    closeElement.src = closeImage;
    closeElement.alt = 'Close'
    closeElement.style.width = '85%';
    const closeContainer = document.getElementById('close-button');

    if (closeContainer) {
        closeContainer.prepend(closeElement);
        closeContainer.addEventListener('click', () => {
            printModal.style.display = 'none';
        });
    }

    const printIcon = document.createElement('img') as HTMLImageElement;
    printIcon.src = printImage;
    printIcon.alt = 'Print';
    printIcon.style.width = '10%';
    document.getElementById('modal-content')?.prepend(printIcon);

    /*
     * QR scanning is performed entirely on the client side using the ZXing library.
     * 
     * When the user selects an image file:
     *  - A blob URL is generated and passed to ZXing's QR decoder
     *  - If a valid QR code is found, its content is extracted (expected to be a PDF URL)
     *  - The extracted URL is sent to the backend via `window.printer.printPdf()` to initiate printing
     */
    const qrReader = new BrowserQRCodeReader();
    // const resultText = document.getElementById('qr-result') as HTMLSpanElement;
    // const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    // const previewContainer = document.getElementById('qr-preview-container');
    // const printingText = document.getElementById('printing-text') as HTMLElement;
    // const printerElement = document.getElementById('printerList') as HTMLSelectElement;
    // const printOption = document.getElementById('optionList') as HTMLSelectElement;
    // fileInput.addEventListener('change', () => {
    //     const file = fileInput.files?.[0];

    //     if (!file) return;

    //     if (!file.type.startsWith('image/')) {
    //         showToast('Please select an image file.', 'error')
    //         return;
    //     }

    //     if (cachedPrinters.length == 0) {
    //         showToast('No printer available!', 'error')
    //         return;
    //     }

    //     if (!printerElement.value) {
    //         alert('Please select printer before printing!');
    //         return;
    //     }

    //     previewContainer.innerHTML = '';
    //     const url = URL.createObjectURL(file);
    //     const newImg = new Image();
    //     newImg.src = url;

    //     newImg.onload = async () => {
    //         try {
    //             /* Scan QR using zxing library */
    //             const result = await qrReader.decodeFromImageElement(newImg);
    //             const pdfURl = result.getText();
    //             resultText.textContent = pdfURl;
    //             // console.log(JSON.parse(result.getText()))
    //             try {
    //                 qrSection.style.display = 'none';
    //                 printingText.style.display = 'block';
    //                 const res = await window.printer.printPdf(pdfURl, printerElement.value, printOption.value as PrintOption);
    //                 showToast(res);
    //             } catch (error) {
    //                 showToast(String(error), 'error');
    //             } finally {
    //                 qrSection.style.display = 'block';
    //                 printingText.style.display = 'none';
    //             }
    //         } catch (err) {
    //             resultText.textContent = 'No QR code detected.';
    //         } finally {
    //             URL.revokeObjectURL(url);
    //         }
    //     };

    //     // Image failed to load
    //     newImg.onerror = () => console.error('[Image] Failed to load blob URL.');
    //     previewContainer.appendChild(newImg);
    // });

    /*
     * Live feedback QR scanning
     */
    const videoElement = document.getElementById('webcam') as HTMLVideoElement;
    const qrSection = document.getElementById('qr-section');
    let controls: any = null;

    const startScanner = async () => {
        try {
            controls = await qrReader.decodeFromVideoDevice(
                null,
                videoElement,
                qrScanCallback
            );
            console.log('Camera started. QR Reader is now scanning for codes...');
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                console.info('Camera access was denied. Please allow camera access.');
            } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
                console.info('No camera device found. Please connect a webcam. Or upload an image below.');
            } else {
                console.info('No camera device found. Please connect a webcam. Or upload an image below.');
            }
        }
    };

    const qrScanCallback = async (result: any, error: any, _controls: any) => {
        if (result) {
            // showResult(result.getText());

            // Stop scanning after first success
            _controls?.stop();
            loadingModal.style.display = 'flex'
            try {
                const waybillInput = document.getElementById('waybill-input') as HTMLInputElement;
                const parsedData: QR = JSON.parse(result.getText());

                qrSection.style.display = 'none';
                waybillInput.value = parsedData.invoice_no;

                // Start both calls in parallel
                const getItemsPromise = window.waybill.getItems(parsedData);
                const printPromise = window.waybill.printPdf(parsedData, 'Brother DCP-T500W', 'waybill' as PrintOption);

                // Await getItems and check result
                const res: any = await getItemsPromise;

                if (res.status !== 'SUCCESS') {
                    showToast(res.response.message, 'error');
                    return;
                }
                loadingModal.style.display = 'none'
                // Populate UI with fetched data
                waybillSection.style.display = 'flex';
                artworkRow.innerHTML = '';
                printModal.style.display = 'flex';

                document.getElementById('waybill-no')!.textContent = `You are printing Waybill No. ${parsedData.invoice_no}.`;

                const order: Order = res.response.data.order;
                document.getElementById('kinds')!.textContent = `${order.total} kinds`;
                document.getElementById('user-header')!.textContent = order.full_name;
                document.getElementById('user-fullname')!.textContent = order.full_name;
                document.getElementById('user-email')!.textContent = order.email;

                res.response.data.items.forEach((item: WaybillItem) => {
                    artworkRow.appendChild(createArtworkCard(item));
                });

                // Now handle print result
                const printRes: any = await printPromise;
                if (printRes.status === 'ERROR') {
                    console.error('Print failed:', printRes.error);
                    showToast('Printing failed: ' + String(printRes.error), 'error');
                }

            } catch (error) {
                showToast(String(error), 'error');
            } finally {
                printModal.style.display = 'none';
                qrSection.style.display = 'block';
                await startScanner();
            }

        } else {
            console.log('Scanning... No QR detected in current frame.');
        }

        if (error && error.name !== 'NotFoundException') {
            console.warn('QR Scan error:', error);
        }
    };

    // Start scanner
    startScanner();

    document.getElementById('home-button')?.addEventListener('click', () => {
        renderPage('landing-page');
        initLandingPage();
    });
}

/* Use this code to initialize/bind the landing page listeners */
const initLandingPage = () => {
    const logo = document.createElement('img') as HTMLImageElement;
    logo.src = compLogo;
    logo.alt = 'Logo';
    logo.style.width = '55px';
    document.getElementById('logo-header')?.prepend(logo);

    document.getElementById('go-to-qr')?.addEventListener('click', () => {
        renderPage('qr-page');
        initQrPage();
    });

    document.getElementById('go-to-config')?.addEventListener('click', () => {
        renderPage('config-page');
        initConfigurationPage();
    });
}

const initConfigurationPage = () => {
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

        cachedPrinters.map((printers: Printer) => {
            const option = document.createElement('option');
            option.dataset.printerId = printers.deviceId;
            option.textContent = `${printers.name}`;
            printerDropdown.appendChild(option);
        })
    }

    fetchPrinters();

    /* Refresh printer list */
    document.getElementById('refresh-printer').addEventListener('click', async () => {
        await fetchPrinters(true);
    })

    document.getElementById('home-button')?.addEventListener('click', () => {
        renderPage('landing-page');
        initLandingPage();
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

/* Code for custom router */
function renderPage(templateId: string) {
    const container = document.getElementById('main-container')!;
    const template = document.getElementById(templateId) as HTMLTemplateElement;

    if (!template) {
        console.error(`Template with id '${templateId}' not found.`);
        return;
    }

    const clone = template.content.cloneNode(true);
    container.innerHTML = '';
    container.appendChild(clone);
}

/* Once dom is loaded render landing page and initialize/bind the event listeners */
document.addEventListener('DOMContentLoaded', () => {
    renderPage('landing-page');
    initLandingPage();
});