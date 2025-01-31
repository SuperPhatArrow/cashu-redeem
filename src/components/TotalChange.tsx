import { X } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from "react"
import {ChangeItem} from "@/types";
import {getFullChange} from "@/utils/changeUtils";

export function CashChangeDisplay({ onClose }: {onClose: () => void}) {
    const [change, setChange] = useState<ChangeItem[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        (async ()=>{
            setLoading(true)
            const localChange = await getFullChange()
            setChange(localChange)
            setLoading(false)
        })()
    }, [])


    const totalsByCurrency = change.reduce((acc, curr) => {
        if (!acc[curr.unit]) {
            acc[curr.unit] = 0
        }
        acc[curr.unit] += curr.amount
        return acc
    }, {} as Record<string, number>)

    const changeByMint = change.reduce((acc, curr) => {
        if (!acc[curr.mint]) {
            acc[curr.mint] = []
        }
        acc[curr.mint].push(curr)
        return acc
    }, {} as Record<string, ChangeItem[]>)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-50"
        >
            <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative overflow-hidden"
            >
                <button
                    onClick={onClose}
                    className="absolute z-10 top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Your Cashu Change</h2>
                </div>
                {isLoading?(
                    <div className="text-center py-8 text-gray-500">
                        Loading change data...
                    </div>):
                change.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        There{"'"}s no change!
                    </div>
                ) : (
                    <>
                        <div className="space-y-6 relative z-10">
                            {Object.entries(changeByMint).map(([mint, changes], mintIndex) => (
                                <motion.div
                                    key={mint}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: mintIndex * 0.1 }}
                                    className="bg-purple-50 p-4 rounded-lg border border-purple-100"
                                >
                                    <div className="font-medium text-purple-700 mb-2">{mint}</div>
                                    <div className="space-y-2">
                                        {changes.map((changeItem, changeIndex) => (
                                            <motion.div
                                                key={`${changeItem.unit}-${changeIndex}`}
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: (mintIndex * 0.1) + (changeIndex * 0.05) }}
                                                className="flex justify-between items-center pl-4 text-sm"
                                            >
                                                <span className="text-purple-600">{changeItem.unit}</span>
                                                <span className="text-purple-900 font-bold">{changeItem.amount}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-6 space-y-2">
                            <div className="text-sm font-medium text-purple-700">Totals by Currency:</div>
                            {Object.entries(totalsByCurrency).map(([unit, total]) => (
                                <div key={unit} className="flex justify-between text-sm px-4">
                                    <span className="text-purple-600">{unit}</span>
                                    <span className="text-purple-900 font-bold">{total}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </motion.div>
        </motion.div>
    )
}