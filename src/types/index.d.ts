import {MeltQuoteResponse} from "@cashu/cashu-ts";

type LNURLResponse = {
    callback: string;
    maxSendable: number;
    minSendable: number;
    metadata: string;
}


type MeltQuoteAcceptanceProps = {
    meltQuote: MeltQuoteResponse,
    onAccept: () => void,
    onReject: () => void,
}

type ChangeItem = {
    mint: string
    unit: string
    amount: number
}

type Settings = {
    includeChange: boolean
    previewMeltQuotes: boolean
}

type ToggleSwitchProps = {
    label: string
    isOn: boolean
    onToggle: () => void
}

export {
    LNURLResponse,
    MeltQuoteAcceptanceProps,
    ChangeItem,
    Settings,
    ToggleSwitchProps,
}

