import { WaybillItem } from "./item";

export interface Order{
    email?: string,
    invoice_no?: string,
    full_name?: string,
    total: number,
    items?: WaybillItem[]
}