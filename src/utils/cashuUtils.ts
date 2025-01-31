
import {CashuWallet, Token,} from "@cashu/cashu-ts";
import {sumProofs} from "@cashu/cashu-ts/dist/lib/es6/utils";
import { Invoice } from "@getalby/lightning-tools"

//estimate value of token
async function getSatValue(wallet:CashuWallet, token:Token):Promise<number> {
    const mintQuote = await wallet.createMintQuote(1)
    const {satoshi:rate} = new Invoice({pr:mintQuote.request})
    return Math.floor(sumProofs(token.proofs)*rate)
}

//estimate value of single token unit
async function getSatPerUnit(wallet:CashuWallet):Promise<number> {
    const mintQuote = await wallet.createMintQuote(1)
    const {satoshi:rate} = new Invoice({pr:mintQuote.request})
    return Math.floor(rate)
}


export {  getSatValue, getSatPerUnit };
