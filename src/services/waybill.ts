import axios from "axios";

export function getWaybillUrl(apiUrl: string, invoiceNo: string) {
    return axios({
        method: 'GET',
        url: `${apiUrl}/index.php/api/qr-scanner/get-waybill-url/${invoiceNo}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Request-From': 'admin-panel',
            // Custom header to bypass Laravel Cors setup
            'X-App-Source': 'electron-app'
        },
    });
}

export function doneInvoice(apiUrl: string, invoiceNo: string) {
    return axios({
        method: 'POST',
        url: `${apiUrl}/index.php/api/qr-scanner/done-invoice/${invoiceNo}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Request-From': 'admin-panel',
            // Custom header to bypass Laravel Cors setup
            'X-App-Source': 'electron-app'
        },
    });
}

export function getWaybillItems(apiUrl: string, invoiceNo: string) {
    return axios({
        method: 'GET',
        url: `${apiUrl}/index.php/api/qr-scanner/get-items/${invoiceNo}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            // Custom header to bypass Laravel Cors setup
            'X-App-Source': 'electron-app'
        },
    });
}