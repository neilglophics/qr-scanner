import axios from "axios";
import { Account } from "../constants/accounts";
import { accountMapper, Environment } from "../utils/account-mapper";

const env = process.env.APP_ENV as Environment;
const apiUrl = accountMapper(Account.SHIPPING, env);
export function getWowPressAccount(invoiceNo: string) {
    return axios({
        url: `${apiUrl}/index.php/api/wp/inspect/${invoiceNo}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
}