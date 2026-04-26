import { useEffect, useRef } from "react";

type PlayerCanvasProps = {
  getAudioData: () => Uint8Array | number[];
  className?: string;
};

function PlayerCanvas({ getAudioData, className }: PlayerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let animationFrameId = 0;
    const startTime = performance.now();

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const audioData = getAudioData();

      resizeCanvas();

      const width = canvas.width;
      const height = canvas.height;

      context.clearRect(0, 0, width, height);

      context.fillStyle = "rgba(5, 8, 22, 0.2)";
      context.fillRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#7c3aed");
      gradient.addColorStop(0.5, "#22d3ee");
      gradient.addColorStop(1, "#06b6d4");

      context.strokeStyle = gradient;
      context.lineWidth = 2;

      context.beginPath();

      const totalPoints = audioData.length || 128;

      for (let index = 0; index < totalPoints; index += 1) {
        const x = (index / Math.max(totalPoints - 1, 1)) * width;
        const baseWave =
          Math.sin(index * 0.14 + elapsed * 1.8) * 22 +
          Math.cos(index * 0.06 + elapsed * 1.2) * 12;

        const audioInfluence =
          audioData[index] !== undefined
            ? (Number(audioData[index]) / 255) * 32
            : 0;

        const y = height / 2 + baseWave - audioInfluence;

        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.stroke();

      context.beginPath();

      for (let index = 0; index < totalPoints; index += 1) {
        const x = (index / Math.max(totalPoints - 1, 1)) * width;
        const secondaryWave =
          Math.sin(index * 0.09 - elapsed * 1.4) * 18 +
          Math.cos(index * 0.04 + elapsed) * 10;

        const y = height / 2 + secondaryWave + 40;

        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.strokeStyle = "rgba(255, 255, 255, 0.18)";
      context.lineWidth = 1;
      context.stroke();

      animationFrameId = window.requestAnimationFrame(render);
    };

    resizeCanvas();
    animationFrameId = window.requestAnimationFrame(render);

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [getAudioData]);

  return <canvas ref={canvasRef} className={className} />;
}

export default PlayerCanvas;
