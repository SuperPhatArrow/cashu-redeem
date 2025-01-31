"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"
import {ToggleSwitchProps} from "@/types";

interface SettingsComponentProps {
    settings: {
        includeChange: boolean
        previewMeltQuotes: boolean
    }
    onSettingsChange: (settings: Partial<{ includeChange: boolean; previewMeltQuotes: boolean }>) => void
    onClose: () => void
}

export function SettingsComponent({ settings, onSettingsChange, onClose }: SettingsComponentProps) {
    const handleToggle = (setting: "includeChange" | "previewMeltQuotes") => {
        onSettingsChange({ [setting]: !settings[setting] })
    }

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
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
                <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Settings</h2>
            <div className="space-y-4">
                <ToggleSwitch label="Include Change" isOn={settings.includeChange} onToggle={() => handleToggle("includeChange")} />
                <ToggleSwitch
                    label="Preview melt quotes"
                    isOn={settings.previewMeltQuotes}
                    onToggle={() => handleToggle("previewMeltQuotes")}
                />
            </div>
            </motion.div>
        </motion.div>
    )
}



function ToggleSwitch({ label, isOn, onToggle }: ToggleSwitchProps) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-700">{label}</span>
            <button
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 ${
                    isOn ? "bg-violet-600" : "bg-gray-200"
                }`}
                onClick={onToggle}
            >
                <span className="sr-only">Toggle {label}</span>
                <motion.span
                    className="inline-block w-4 h-4 transform bg-white rounded-full"
                    layout
                    transition={{
                        type: "spring",
                        stiffness: 700,
                        damping: 30,
                    }}
                    style={{ x: isOn ? 20 : 2 }}
                />
            </button>
        </div>
    )
}

