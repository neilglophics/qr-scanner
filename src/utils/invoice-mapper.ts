import { Account } from "../constants/accounts";

export default function invoiceMapper(invoiceNo: string): Account | null {
    if (invoiceNo.startsWith('1')) return Account.SG;
    if (invoiceNo.startsWith('2')) {
        if (invoiceNo.length === 10) return Account.JP; // Japan
        if (invoiceNo.length === 11) return Account.NZ;
    }
    if (invoiceNo.startsWith('3')) return Account.AU;
    if (invoiceNo.startsWith('4')) return Account.UK;
    if (invoiceNo.startsWith('5')) return Account.US;
    if (invoiceNo.startsWith('6')) return Account.CA;
}