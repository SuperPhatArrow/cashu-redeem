import {WebLNProvider} from "@webbtc/webln-types";
import {LightningAddress} from "@getalby/lightning-tools";
import {bech32} from "bech32";
import {LNURLResponse} from "@/types";

const URL_REGEX =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/;

export const isUrl = (url: string | null): url is string => {
    if (!url) return false;
    return URL_REGEX.test(url);
};

//request invoice from Wallet Connect provider or from Lighting Address
async function createInvoice(amount:number, source:WebLNProvider|LightningAddress|LNURLResponse):Promise<string|undefined> {
    if(!source){
        throw new Error("source is missing");
    }
    if (source instanceof LightningAddress) {
        await source.fetch();
        const {paymentRequest} = await source.requestInvoice({satoshi: amount});
        return paymentRequest;
    } else if (typeof source === 'object' && 'enable' in source && 'makeInvoice' in source){
        await source.enable();
        const {paymentRequest} = await source.makeInvoice(amount);
        return paymentRequest;
    } else if(typeof source === 'object' && 'callback' in source && 'maxSendable' in source && 'minSendable' in source && 'metadata' in source) {
        return await handleLNURL(source, amount);
    }
}

async function handleLNURL(lnurlData:LNURLResponse, amount: number): Promise<string> {

    if (amount < lnurlData.minSendable || amount > lnurlData.maxSendable) {
        throw new Error(`Amount must be between ${lnurlData.minSendable} and ${lnurlData.maxSendable} sats`);
    }

    const invoiceResponse = await fetch(`${lnurlData.callback}?amount=${amount * 1000}`);
    if (!invoiceResponse.ok) {
        throw new Error('Failed to get invoice from LNURL');
    }
    const { pr: paymentRequest } = await invoiceResponse.json();
    return paymentRequest;
}

async function fetchLNURLData(lnurl: string):Promise<LNURLResponse> {
    const { words } = bech32.decode(lnurl.toLowerCase(), 2000);
    const requestByteArray = bech32.fromWords(words);
    const url = Buffer.from(requestByteArray).toString();
    if(!isUrl(url)){
        throw new Error("Cannot parse LNURL from input!")
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch LNURL data');
    }
    return response.json();
}

export {createInvoice, fetchLNURLData}
