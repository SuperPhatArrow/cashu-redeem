'use client'

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        ctx.imageSmoothingEnabled = false

        const gridSize = 32
        const cols = Math.ceil(canvas.width / gridSize)
        const rows = Math.ceil(canvas.height / gridSize)

        const cells = Array(rows).fill(0).map(() =>
            Array(cols).fill(0).map(() => ({
                value: Math.random(),
                targetValue: Math.random(),
                speed: 0.01 + Math.random() * 0.02
            }))
        )

        function drawCell(x: number, y: number, value: number) {
            if(!ctx){
                return
            }
            const size = gridSize * 0.8
            const xPos = x * gridSize + (gridSize - size) / 2
            const yPos = y * gridSize + (gridSize - size) / 2

            ctx.fillStyle = `rgba(147, 51, 234, ${value * 0.15})`
            ctx.fillRect(
                Math.floor(xPos),
                Math.floor(yPos),
                Math.ceil(size),
                Math.ceil(size)
            )

            if (value > 0.5) {
                const smallSize = size * 0.2
                ctx.fillStyle = `rgba(216, 180, 254, ${value * 0.2})`
                ctx.fillRect(
                    Math.floor(xPos + size - smallSize),
                    Math.floor(yPos),
                    Math.ceil(smallSize),
                    Math.ceil(smallSize)
                )
            }
        }

        function updateCells() {
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const cell = cells[y][x]

                    const diff = cell.targetValue - cell.value
                    if (Math.abs(diff) < 0.01) {
                        cell.targetValue = Math.random()
                    } else {
                        cell.value += diff * cell.speed
                    }
                }
            }
        }

        function draw() {
            if(!ctx||!canvas){
                return
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
            gradient.addColorStop(0, '#f3e8ff')
            gradient.addColorStop(1, '#ffffff')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    drawCell(x, y, cells[y][x].value)
                }
            }

            ctx.fillStyle = 'rgba(147, 51, 234, 0.03)'
            for (let y = 0; y < canvas.height; y += 4) {
                ctx.fillRect(0, y, canvas.width, 1)
            }
        }

        function animate() {
            updateCells()
            draw()
            requestAnimationFrame(animate)
        }

        animate()

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            ctx.imageSmoothingEnabled = false
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full"
            style={{
                background: 'linear-gradient(to bottom right, #f3e8ff, #ffffff)',
                opacity: 0.7
            }}
        />
    )
}

