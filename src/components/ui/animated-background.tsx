'use client';

import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({
  className = '',
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Blob configuration
    const blobs = [
      {
        x: 0.2,
        y: 0.3,
        size: 0.3,
        color: { r: 255, g: 182, b: 193, a: 0.1 }, // Light pink
        speed: 0.0005,
        direction: { x: 1, y: 0.5 },
      },
      {
        x: 0.7,
        y: 0.1,
        size: 0.25,
        color: { r: 221, g: 160, b: 221, a: 0.08 }, // Lavender
        speed: 0.0003,
        direction: { x: -0.7, y: 0.8 },
      },
      {
        x: 0.1,
        y: 0.7,
        size: 0.35,
        color: { r: 173, g: 216, b: 230, a: 0.06 }, // Pale sky blue
        speed: 0.0004,
        direction: { x: 0.5, y: -0.3 },
      },
      {
        x: 0.8,
        y: 0.6,
        size: 0.2,
        color: { r: 255, g: 218, b: 185, a: 0.07 }, // Peach
        speed: 0.0006,
        direction: { x: -0.4, y: -0.6 },
      },
    ];

    // Noise texture function
    const createNoiseTexture = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 0.1; // Very subtle noise
        data[i] = 255; // R
        data[i + 1] = 255; // G
        data[i + 2] = 255; // B
        data[i + 3] = noise * 255; // A
      }

      return imageData;
    };

    const drawBlob = (blob: (typeof blobs)[0], t: number) => {
      const x =
        (blob.x + Math.sin(t * blob.speed + blob.direction.x) * 0.1) *
        canvas.width;
      const y =
        (blob.y + Math.cos(t * blob.speed + blob.direction.y) * 0.1) *
        canvas.height;
      const size = blob.size * Math.min(canvas.width, canvas.height);

      // Create gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(
        0,
        `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${blob.color.a})`
      );
      gradient.addColorStop(
        0.7,
        `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${blob.color.a * 0.5})`
      );
      gradient.addColorStop(
        1,
        `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`
      );

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw blobs
      blobs.forEach(blob => drawBlob(blob, time));

      // Draw noise texture
      const noiseTexture = createNoiseTexture();
      ctx.putImageData(noiseTexture, 0, 0);

      time += 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={`fixed inset-0 -z-10 ${className}`} style={{ zIndex: -1 }}>
      <canvas
        ref={canvasRef}
        className='w-full h-full'
        style={{
          background:
            'linear-gradient(135deg, #fef7f0 0%, #f8f4ff 50%, #f0f9ff 100%)',
          zIndex: -1,
        }}
      />
    </div>
  );
}

