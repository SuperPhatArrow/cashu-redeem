'use client'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {AnimatedBackground} from "@/components/AnimatedBackground"
import {CashuMint, CashuWallet, getDecodedToken, MeltQuoteResponse, Token} from "@cashu/cashu-ts"
import {LightningAddress} from "@getalby/lightning-tools"
import {WebLNProvider} from "@webbtc/webln-types"
import {AnimatePresence, motion} from 'motion/react'
import dynamic from "next/dynamic"
import MeltQuoteAcceptance from "@/components/MeltQuoteAcceptance"
import {getSatPerUnit, getSatValue} from "@/utils/cashuUtils"
import toast from "react-hot-toast"
import {mergeChange, removeUsedProofs, storeMint, storeProofs} from "@/utils/changeUtils"
import {createInvoice, fetchLNURLData} from "@/utils/lightningUtils"
import {CashChangeDisplay} from "@/components/TotalChange";
import {useSearchParams} from 'next/navigation'
import {LNURLResponse} from "@/types";
import {Settings} from "lucide-react";
import {SettingsComponent} from "@/components/Settings";
import {useSettings} from "@/hooks/useSettings";
import Image from "next/image";
const Button = dynamic(
    () => import('@getalby/bitcoin-connect-react').then((mod) => mod.Button),
    {ssr: false}
);

export default function CashuRedemption() {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [meltQuote, setMeltQuote] = useState<MeltQuoteResponse>();
    const [provider, setProvider] = useState<WebLNProvider>();
    const [lightningInput, setLightningInput] = useState<LightningAddress | LNURLResponse>();
    const [token, setToken] = useState<Token>();
    const [showTotalChange, setShowTotalChange] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [settings, setSettings] = useSettings();

    const tokenRef = useRef<HTMLInputElement>(null);
    const lightningInputRef = useRef<HTMLInputElement>(null);

    const searchParams = useSearchParams();
    const autopayParam = searchParams.get('autopay') ?? ""
    const tokenParam = searchParams.get('token') ?? ""
    const lightningParam = searchParams.get('lightning') ?? searchParams.get('ln') ?? searchParams.get('to') ?? ""

    const resetForm = useCallback(() => {
        if (tokenRef.current) {
            tokenRef.current.value = ''
        }
        if (lightningInputRef.current) {
            lightningInputRef.current.value = ''
        }
        setToken(undefined)
        setMeltQuote(undefined)
        setLoading(false)
    }, [])

    const handleError = useCallback((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
        setLoading(false)
        toast.error(errorMessage)
        console.error(error)
    }, [])

    const validateInput = useCallback(async () => {
        try {
            setLoading(true)

            if (!tokenRef?.current?.value) {
                throw new Error('Please enter a token')
            }

            const decodedToken = getDecodedToken(tokenRef.current.value)
            if (!decodedToken?.proofs?.length || !decodedToken.unit) {
                throw new Error('Invalid token format')
            }

            if (settings.includeChange) {
                const proofsWithChange = await mergeChange(decodedToken)
                decodedToken.proofs = [...proofsWithChange]
            }

            setToken(decodedToken)
            const mint = new CashuMint(decodedToken.mint)
            const wallet = new CashuWallet(mint, {unit: decodedToken.unit})

            toast.loading("Calculating amount", {id: "redeem"})
            const amount = await getSatValue(wallet, decodedToken)
            let invoice: string | undefined;

            if (provider) {
                toast.loading("Requesting invoice", {id: "redeem"})
                invoice = await createInvoice(amount, provider)
                if (!invoice) {
                    throw new Error("Failed to create invoice")
                }
                toast.loading("Requesting melt quote", {id: "redeem"})
                const quote = await wallet.createMeltQuote(invoice)
                setMeltQuote(quote)
                toast.success("Ready to process redemption", {id: "redeem"})
                return;
            }

            if (!lightningInputRef?.current?.value) {
                throw new Error('Please connect a wallet or enter a lightning address')
            }

            if (lightningInputRef.current.value.toLowerCase().startsWith("lnurl1")) {
                const lnurlData = await fetchLNURLData(lightningInputRef.current.value)
                setLightningInput(lnurlData)
                toast.loading("Requesting invoice", {id: "redeem"})
                invoice = await createInvoice(amount, lnurlData)
            } else {
                const address = new LightningAddress(lightningInputRef.current.value)
                await address.fetch()
                setLightningInput(address)
                toast.loading("Requesting invoice", {id: "redeem"})
                invoice = await createInvoice(amount, address)
            }
            if (!invoice) {
                throw new Error(`Couldn't create invoice..`)
            }
            toast.loading("Requesting melt quote", {id: "redeem"})
            const quote = await wallet.createMeltQuote(invoice)
            setMeltQuote(quote)
            toast.success("Ready to process redemption", {id: "redeem"})
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false)
        }
    }, [settings.includeChange, provider, handleError])

    const meltToken = useCallback(async () => {
        if (!meltQuote || !token) return

        try {
            setLoading(true)
            const mint = new CashuMint(token.mint)
            const wallet = new CashuWallet(mint, {unit: token.unit})
            const amountToMelt = meltQuote.amount - meltQuote.fee_reserve;

            toast.loading("Processing redemption", {id: "redeem"})
            const rate = await getSatPerUnit(wallet)
            if (!provider && !lightningInput) {
                throw new Error('Please connect a wallet or enter a lightning address')
            }
            const secondInvoice = await createInvoice(amountToMelt * rate, provider || lightningInput!)

            if (!secondInvoice) {
                throw new Error("Failed to create final invoice")
            }

            const newQuote = await wallet.createMeltQuote(secondInvoice)
            const {keep, send} = await wallet.send(newQuote.amount + newQuote.fee_reserve, token.proofs)

            toast.loading("Finalizing redemption", {id: "redeem"})
            const {change} = await wallet.meltProofs(newQuote, send)

            const finalProofs = [...keep, ...change]

            //remove already melted proofs from localstorage
            removeUsedProofs(token.proofs)
            //store change
            storeProofs(finalProofs);
            //store mint of proofs
            storeMint(mint.mintUrl)
            setLoading(false);
            toast.success("Redemption successful!", {id: "redeem"})

            setTimeout(resetForm, 2000)

        } catch (error) {
            handleError(error)
        }
    }, [meltQuote, token, provider, lightningInput, handleError, resetForm])

    useEffect(() => {
        let isSubscribed = true

        async function validateByParams() {
            if (!lightningParam || !tokenParam) {
                return
            }

            try {
                if (lightningInputRef.current && tokenRef.current) {
                    lightningInputRef.current.value = lightningParam
                    tokenRef.current.value = tokenParam

                    if (isSubscribed) {
                        await validateInput()
                    }
                }
            } catch (error) {
                if (isSubscribed) {
                    handleError(error)
                }
            }
        }

        validateByParams()

        return () => {
            isSubscribed = false
        }
    }, [handleError, lightningParam, tokenParam, validateInput]);

    useEffect(() => {
        let isSubscribed = true

        async function handleAutoMelt() {
            if (!!autopayParam && meltQuote && token) {
                try {
                    if (isSubscribed) {
                        await meltToken()
                    }
                } catch (error) {
                    if (isSubscribed) {
                        handleError(error)
                    }
                }
            }
        }

        handleAutoMelt()

        return () => {
            isSubscribed = false
        }
    }, [meltQuote, token, autopayParam, meltToken, handleError]);

    useEffect(()=>{
        if (!settings.previewMeltQuotes&&meltQuote) {
            meltToken();
        }
    }, [meltQuote, meltToken, settings.previewMeltQuotes])
    useEffect(() => {
        return () => {
            toast.dismiss("redeem")
        }
    }, [])

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12 relative overflow-hidden">
            <AnimatedBackground/>
            <nav className="absolute flex justify-between items-center z-10 w-full py-5 px-5 top-0">
                <div className="flex-shrink-0">
                    <Image src="/CoolCashu.png" width={50} height={50} alt="Cool Cashu logo"
                           className="w-[50px] h-[50px]"/>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                        aria-label="Toggle settings"
                    >
                        <Settings className="w-5 h-5 text-violet-600"/>
                    </button>
                    <div className="flex-shrink-0">
                        <Button
                            onConnected={async (provider) => setProvider(provider)}
                            onDisconnected={async () => setProvider(undefined)}
                        />
                    </div>
                </div>
            </nav>
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="relative py-3 sm:max-w-xl sm:mx-auto z-10"
            >
                <div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-5">Cashu Redeem</h1>
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Cashu Token</label>
                                <div className="relative">
                                    <input
                                        ref={tokenRef}
                                        type="text"
                                        disabled={isLoading}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 sm:text-sm disabled:opacity-50"
                                        placeholder="Enter or paste Cashu token"
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {!provider && (
                                    <motion.div
                                        initial={{opacity: 0, height: 0}}
                                        animate={{opacity: 1, height: 'auto'}}
                                        exit={{opacity: 0, height: 0}}
                                        className="flex flex-col"
                                    >
                                        <label className="text-sm font-medium text-gray-700 mb-1">
                                            Lightning Address or LNURL
                                        </label>
                                        <input
                                            ref={lightningInputRef}
                                            type="text"
                                            disabled={isLoading}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 sm:text-sm disabled:opacity-50"
                                            placeholder="Enter Lightning address or LNURL"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button
                                className="w-full px-4 py-2 text-lg font-medium text-white bg-violet-600 rounded-md hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-300 transition duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                onClick={async () => {
                                     await validateInput();
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Redeem Token'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <footer className="mt-8 text-center text-sm text-gray-600 relative z-10">
                <p>Cashu is an open-source protocol for private digital cash.</p>
                <p>Learn more at <a href="https://cashu.space"
                                    className="text-violet-600 hover:underline">cashu.space</a></p>
            </footer>

            <button
                className={"px-4 py-2 text-md w-[200px] absolute bottom-5 right-5 font-medium text-white bg-violet-600 rounded-md hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-300 transition duration-150 ease-in-out transform hover:scale-105"}
                disabled={false} onClick={() => setShowTotalChange(true)}>View Stored Change
            </button>

            <AnimatePresence>
                {meltQuote && settings.previewMeltQuotes && (
                    <MeltQuoteAcceptance
                        meltQuote={meltQuote}
                        onAccept={() => meltToken()}
                        onReject={() => {
                            setMeltQuote(undefined);
                            setLoading(false);
                            toast.dismiss("redeem")
                        }}
                    />
                )}
                {showTotalChange && (
                    <CashChangeDisplay onClose={() => {
                        setShowTotalChange(false)
                    }}/>
                )}
                {showSettings && (
                    <SettingsComponent
                        settings={settings}
                        onSettingsChange={setSettings}
                        onClose={() => setShowSettings(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}