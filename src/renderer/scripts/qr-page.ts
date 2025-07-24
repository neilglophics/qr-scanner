
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
    const printModal = document.getElementById('modal-overlay') as HTMLDivElement;
    const waybillSection = document.getElementById('waybill-content') as HTMLDivElement;
    const loadingModal = document.getElementById('loading-modal') as HTMLDivElement;
    const toast = document.getElementById('toast')!;
    const waybillToast = document.getElementById('toast-waybill-box')!;
    const artworkRow = document.getElementById('artwork-row') as HTMLElement;
    const waybillContent = document.getElementById('waybill-content') as HTMLElement;

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
        try {
            const startTime = Date.now();
            // Start both async calls in parallel
            const getItemsPromise = window.waybill.getItems(data);
            const printPromise = window.waybill.printPdf(data, selectedPrinter, 'waybill' as PrintOption);

            // Await getItems and check result
            const res: any = await getItemsPromise;
            if (res.status !== 'SUCCESS') {
                loadingModal.style.display = 'none'
                showToast(res.error, 'error');
                return;
            }

            loadingModal.style.display = 'none'
            waybillSection.style.display = 'flex';
            printModal.style.display = 'flex';

            if (res.response.data.length > 1) {
                document.getElementById('waybill-no')!.textContent = `Printing multiple waybills for invoice ${data.invoice_no}.`;
            } else {
                document.getElementById('waybill-no')!.textContent = `You are printing Waybill No. ${data.invoice_no}.`;
            }

            const order: Order[] = res.response.data;
            mapOrderData(order);

            // Now handle print result
            const printRes: any = await printPromise;
            if (printRes.failedWaybillItems && printRes.failedWaybillItems.length > 0) {
                waybillToast.innerHTML = '';

                const heading = document.createElement('div');
                heading.innerHTML = '<strong>Error printing waybill(s):</strong>';
                waybillToast.appendChild(heading);

                const explanation = document.createElement('div');
                explanation.textContent = "These invoice(s) don't have waybills yet.";
                explanation.style.fontSize = '0.9rem'; // optional: smaller font
                explanation.style.marginTop = '4px';
                waybillToast.appendChild(explanation);

                const ul = document.createElement('ul');
                ul.style.margin = '0';
                ul.style.paddingLeft = '1rem';

                printRes.failedWaybillItems.forEach((item: any) => {
                    const li = document.createElement('li');
                    li.textContent = item.invoice;
                    ul.appendChild(li);
                });

                waybillToast.appendChild(ul);

                waybillToast.style.display = 'flex';
            }

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
        waybillToast.style.display = 'none';
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
            console.log(raw)
            try {
                // TODO condition if string starts with WP
                let parsed
                if (raw.startsWith('WP')) {
                    console.log('inside condition')
                    parsed = {
                        invoice_no: raw
                    }
                } else {
                    parsed = JSON.parse(raw);
                    if (typeof JSON.parse(raw) !== 'object') {
                        showToast('Invalid QR code detected!', 'error');
                        return
                    }
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

    const mapOrderData = (orders: Order[]) => {
        waybillContent.innerHTML = '';
        orders.forEach((order) => {
            // Container per order
            const orderContainer = document.createElement('div');
            orderContainer.className = 'order_container';

            // Header
            const waybillHeader = document.createElement('div');
            waybillHeader.className = 'waybill_header';

            const header = document.createElement('h1');
            header.textContent = order.full_name;
            waybillHeader.appendChild(header);

            const kinds = document.createElement('p');
            kinds.className = 'kinds';
            kinds.textContent = `${order.total} kinds`;
            waybillHeader.appendChild(kinds);

            // Subheader
            const subHeader = document.createElement('div');
            subHeader.className = 'waybill_subheader';

            const invoiceNo = document.createElement('p');
            invoiceNo.textContent = `Invoice No: ${order.invoice_no}`;
            subHeader.appendChild(invoiceNo);

            const fullName = document.createElement('p');
            fullName.textContent = order.full_name;
            subHeader.appendChild(fullName);

            const email = document.createElement('p');
            email.textContent = order.email;
            subHeader.appendChild(email);

            // Artwork row
            const artworkRow = document.createElement('div');
            artworkRow.className = 'artwork_row';

            order.items.forEach((item) => {
                artworkRow.appendChild(createArtworkCard(item));
            });

            orderContainer.appendChild(waybillHeader);
            orderContainer.appendChild(subHeader);
            orderContainer.appendChild(artworkRow);

            waybillContent.appendChild(orderContainer);
        });
    }


    /* Artwork Items script */
    // Dynamically generates a single artwork card element for a given user/item.
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
            let title = `${waybillItem.product_name}`;

            if (waybillItem.supply) {
                title = title.concat(` / ${waybillItem.supply}`)
            }

            if (waybillItem.finishing) {
                title = title.concat(` / ${waybillItem.finishing}`)
            }

            name.textContent = title;
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