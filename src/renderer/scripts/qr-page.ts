
import { BrowserQRCodeReader } from '@zxing/browser';
import { PrintOption } from 'src/constants/print-option';
import closeImage from '../../assets/close_icon.png';
import printImage from '../../assets/print.png';
import { QR } from 'src/models/qr';
import { WaybillItem } from 'src/models/item';
import { Order } from 'src/models/order';
import infoImage from '../../assets/Info.png';
import './landing-page';
import { registerPage, renderPage } from './render-page';
import { selectedPrinter } from './configuration-page';
let intervalId: ReturnType<typeof setInterval> | null = null;

export const initQrPage = () => {
    /* Topbar Script */
    const waybillInput = document.getElementById('waybill-input') as HTMLInputElement;
    const waybillQrInput = document.getElementById('waybill-qr-input') as HTMLInputElement;
    const clearBtn = document.getElementById('clear-button');
    const viewButton = document.getElementById('view-waybill') as HTMLButtonElement;
    const printWayBill = document.getElementById('print-waybill') as HTMLButtonElement;
    const errorMessage = document.getElementById('error-message') as HTMLDivElement;
    const printModal = document.getElementById('modal-overlay') as HTMLDivElement;
    const waybillSection = document.getElementById('waybill-content') as HTMLDivElement;
    const loadingModal = document.getElementById('loading-modal') as HTMLDivElement;
    const toast = document.getElementById('toast')!;

    /* Util Functions */
    // When tab is focused, focus on waybill input
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            waybillQrInput.focus();
        }
    });

    waybillQrInput.focus()

    let lastManualFocusTime = 0;

    // Track when the user clicks or types in the visible input
    waybillInput.addEventListener('focus', () => {
        clearToast();
        lastManualFocusTime = Date.now();
    });
    waybillInput.addEventListener('keydown', () => {
        lastManualFocusTime = Date.now();
    });

    // Interval to keep scanner input focused unless user is actively typing in visible input
    intervalId = setInterval(() => {
        const timeSinceManualFocus = Date.now() - lastManualFocusTime;
        if (document.activeElement != waybillQrInput && timeSinceManualFocus > 6000) {
            waybillQrInput.focus();
        }
    }, 1000);

    const handleWaybillPrint = async (data: QR, isLiveQr: boolean = false) => {
        if (isLiveQr == true) {
            try {
                // qrSection.style.display = 'none';
                waybillInput.value = data.invoice_no;

                // Start both calls in parallel
                const getItemsPromise = window.waybill.getItems(data);
                const printPromise = window.waybill.printPdf(data, selectedPrinter, 'waybill' as PrintOption);

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
                    showToast('Printing failed: ' + String(printRes.error), 'error');
                }

            } catch (error) {
                showToast(String(error), 'error');
            } finally {
                printModal.style.display = 'none';
                // qrSection.style.display = 'block';
                await startScanner();
            }
        } else {
            try {
                const startTime = Date.now();
                // Start both async calls in parallel
                const getItemsPromise = window.waybill.getItems(data, true);
                const printPromise = window.waybill.printPdf(data, selectedPrinter, 'waybill' as PrintOption, true);

                // Await getItems and check result
                const res: any = await getItemsPromise;
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
                document.getElementById('invoice-no')!.textContent = order.invoice_no;
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

                // Format timestamp to HH:MM:SS.mmm
                const formatTime = (timestamp: number) => {
                    const date = new Date(timestamp);
                    return date.toLocaleTimeString('en-US', { hour12: false }) + '.' + date.getMilliseconds().toString().padStart(3, '0');
                };
                const endTime = Date.now()
                const durationMs = endTime - startTime;
                const durationSec = (durationMs / 1000).toFixed(2);
                console.log(`Start time: ${formatTime(startTime)}`);
                console.log(`End time:   ${formatTime(endTime)}`);
                console.log(`Duration:   ${durationSec} s (${durationMs.toFixed(2)} ms)`);
            }
            catch (error) {
                showToast(String(error), 'error');
            }
        }
    }

    function showToast(message: string, type = 'sucess') {
        toast.textContent = message;
        toast.style.display = 'flex';

        if (type === 'error') {
            toast.style.backgroundColor = '#D32F2F';
        } else {
            toast.style.backgroundColor = '#323232';
        }
    }

    function clearToast() {
        toast.style.display = 'none';
    }


    printWayBill.addEventListener('click', async () => {
        const waybillInput = document.getElementById('waybill-input') as HTMLInputElement;

        if (waybillInput.value === '') {
            showToast('Invoice number should not be empty', 'error')
        }
        loadingModal.style.display = 'flex'
        const data: QR = {
            invoice_no: waybillInput.value,
        }

        await handleWaybillPrint(data)
            .then(() => {
                waybillInput.value = '';
                waybillQrInput.value = '';
                waybillQrInput.disabled = false;
                waybillQrInput.focus();
            });;
    })

    waybillQrInput.addEventListener('keydown', async (e) => {
        clearToast();
        if (e.key === 'Enter') {
            const raw = waybillQrInput.value.trim();
            try {
                const parsed = JSON.parse(raw);
                if (typeof JSON.parse(raw) !== 'object') {
                    showToast('Invalid QR code detected!', 'error');
                    return
                }
                waybillQrInput.disabled = true;
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                });
                waybillInput.value = parsed.invoice_no;
                waybillInput.dispatchEvent(enterEvent);
            } catch (err) {
                showToast('Invalid QR code or data format', 'error');
                waybillQrInput.value = '';
                waybillQrInput.disabled = false;
                waybillQrInput.focus()
                return;
            }
        }
    })

    waybillInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loadingModal.style.display = 'flex'
            const value = waybillInput.value.trim()

            if (value === '') {
                showToast('Invoice number should not be empty', 'error')
            }

            const data: QR = {
                invoice_no: value,
            }

            await handleWaybillPrint(data)
                .then(() => {
                    waybillInput.value = '';
                    waybillQrInput.value = '';
                    waybillQrInput.disabled = false;
                    waybillQrInput.focus();
                });
        }
    });

    waybillInput.addEventListener('input', () => {
        clearBtn.style.display = waybillInput.value ? 'block' : 'none';
        viewButton.style.opacity = waybillInput.value ? '100' : '0.5';
        viewButton.disabled = false;
        printWayBill.style.opacity = waybillInput.value ? '100' : '0.5';
        printWayBill.disabled = false;
    });

    clearBtn.addEventListener('click', () => {
        waybillInput.value = '';
        clearBtn.style.display = 'none';
        viewButton.style.opacity = '0.5';
        viewButton.disabled = true;
        printWayBill.style.opacity = '0.5';
        printWayBill.disabled = true;
        waybillQrInput.focus();
    });

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
    // const qrSection = document.getElementById('qr-section');
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
            const parsedData: QR = JSON.parse(result.getText());
            await (handleWaybillPrint(parsedData, true))

        } else {
            console.log('Scanning... No QR detected in current frame.');
        }

        if (error && error.name !== 'NotFoundException') {
            console.warn('QR Scan error:', error);
        }
    };

    // Used to start scanner for webcam devices
    // startScanner();

    document.getElementById('home-button')?.addEventListener('click', () => {
        console.log('heereee');
        renderPage('landing-page');
    });
}


export function cleanupQrPage() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

registerPage('qr-page', {
    init: initQrPage,
    cleanup: cleanupQrPage
});