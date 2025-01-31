import React from 'react';
import { motion } from 'framer-motion';
import {MeltQuoteAcceptanceProps} from "@/types";


export default function MeltQuoteAcceptance(
    {meltQuote, onAccept, onReject}:MeltQuoteAcceptanceProps)
{
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
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Melt Quote</h2>
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Amount to be melted:</span> {meltQuote.amount}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Fee reserve:</span> {meltQuote.fee_reserve}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Avaible to redeem:</span> {meltQuote.amount - meltQuote.fee_reserve}
                    </p>
                </div>

                <div className="mt-6 flex justify-between">

                        <div className={"flex justify-end space-x-3"}>
                            <button
                                onClick={onReject}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Reject
                            </button>
                            <button
                                onClick={()=>onAccept()}
                                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
            </motion.div>
        </motion.div>
);
};