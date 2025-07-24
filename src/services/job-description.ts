import axios from "axios";
import { QR } from "src/models/qr";

export function getJobDetails(apiUrl: string, data: QR) {
    return axios({
        method: 'GET',
        url: `${apiUrl}/index.php/pdf/job-details/preview`,
        params: {
            invoice_no: data.invoice_no,
            order_master_id: data.id,
            email: data.email
        },
        responseType: 'stream'
    });
}