import { useState, useEffect } from "react"
import {Settings} from "@/types";


const defaultSettings: Settings = {
    includeChange: true,
    previewMeltQuotes: false,
}

export function useSettings() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    useEffect(() => {
        const storedSettings = localStorage.getItem("cashuRedeemSettings");
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
        }
    }, [])

    const updateSettings = (newSettings: Partial<Settings>) => {
        const updatedSettings = { ...settings, ...newSettings }
        setSettings(updatedSettings)
        localStorage.setItem("cashuRedeemSettings", JSON.stringify(updatedSettings))
    }

    return [ settings, updateSettings ] as const
}

