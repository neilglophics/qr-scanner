import { Account } from "../constants/accounts";

export type Environment = 'local' | 'development' | 'live';

const API_URLS: Record<Account, Record<Environment, string>> = {
    AU: {
        local: 'http://api.ozstickerprinting',
        development: 'https://dev-api.ozstickerprinting.com',
        live: 'https://api.ozstickerprinting.com'
    },
    CA: {
        local: 'http://api.stickercanada',
        development: 'https://dev-api.stickercanada.com',
        live: 'https://api.stickercanada.com'
    },
    UK: {
        local: 'http://api.stickermarket',
        development: 'https://dev-api.stickermarket.co.uk',
        live: 'https://api.stickermarket.co.uk'
    },
    US: {
        local: 'http://api.allstickerprinting',
        development: 'https://dev-api.allstickerprinting.com',
        live: 'https://api.allstickerprinting.com'
    },
    SG: {
        local: 'http://api.singaprinting',
        development: 'https://dev-api.singaprinting.com',
        live: 'https://api.singaprinting.com'
    },
    NZ: {
        local: 'http://api.stickerdot',
        development: 'https://dev-api.stickerdot.co.nz',
        live: 'https://api.stickerdot.co.nz'
    },
    JP: {
        local: 'http://api.stickerjapan',
        development: 'https://dev-api.stickerjapan.com',
        live: 'https://api.stickerjapan.com'
    },
}

export function accountMapper(account: Account, env: Environment): string {
    return API_URLS[account][env];
}