import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import {Toaster} from "react-hot-toast";
import {Suspense} from "react";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Cashu Redeem',
    description: 'Redeem your Cashu tokens easily',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <Suspense fallback={null}>
        <Toaster
            position="top-center"
            reverseOrder={false}
        />{children}
        </Suspense>
        </body>
        </html>
    )
}

