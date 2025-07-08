export interface Printer {
    deviceId: string,
    name: string,
    paperSizes?: string[],
}

// enum PaperSize {
//     LETTER,
//     TABLOID,
//     LEGAL,
//     STATEMENT,
//     A4,
//     EXECUTIVE
// }