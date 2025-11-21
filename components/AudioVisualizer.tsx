
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    analyser: AnalyserNode;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size based on container
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Visualization config
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let animationId: number;

        const draw = () => {
            animationId = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            // Clear with transparency
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            // Draw bars
            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 255 * canvas.height;

                // Create gradient for each bar
                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, '#22d3ee'); // Cyan
                gradient.addColorStop(1, '#d946ef'); // Fuchsia

                ctx.fillStyle = gradient;
                
                // Draw rounded top bars
                ctx.beginPath();
                ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
                ctx.fill();

                x += barWidth + 1;
            }
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, [analyser]);

    return (
        <div className="w-full h-24 bg-black/20 rounded-lg overflow-hidden backdrop-blur-sm border border-[var(--color-border)]">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};

export default AudioVisualizer;
