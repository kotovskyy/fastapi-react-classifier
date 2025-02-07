import React, { useState, useEffect, useRef, use } from 'react';
import api from '../utils/api';

interface DetectionResult {
    label: string;
    confidence: number;
    bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

const ObjectDetection: React.FC = () => {
    const [results, setResults] = useState<DetectionResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [image, setImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const uploadImage = async (file: File) => {
        setLoading(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
        };

        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResults(response.data.results);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setLoading(false);
        }
    };

    const drawBoundingBoxes = () => {
        if (image && results.length > 0 && canvasRef.current && imageRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = image;

            img.onload = () => {
                if (ctx) {
                    // Ensure canvas size matches the image size
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;

                    // Draw the image on the canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Scale based on device DPI
                    const scaleFactor = window.devicePixelRatio || 1;
                    const strokeWidth = 3 * scaleFactor; // Increase stroke width
                    const fontSize = 16 * 1.5 * scaleFactor; // Increase font size

                    const bgPadding = 5; // Padding around text
                    const bgHeight = fontSize + bgPadding * 2; // Scale background height

                    // Draw bounding boxes
                    results.forEach((result) => {
                        const [x1, y1, x2, y2] = result.bbox;
                        const width = (x2 - x1) * img.naturalWidth;
                        const height = (y2 - y1) * img.naturalHeight;
                        const left = Math.max(x1 * img.naturalWidth, 0);
                        const top = Math.max(y1 * img.naturalHeight, 0);

                        // Draw bounding box
                        ctx.beginPath();
                        ctx.rect(left, top, width, height);
                        ctx.lineWidth = strokeWidth;
                        ctx.strokeStyle = '#00ff00';
                        ctx.stroke();

                        const label = `${result.label} (${(result.confidence * 100).toFixed(2)}%)`;

                        ctx.font = `${fontSize}px Arial`;
                        const textWidth = ctx.measureText(label).width;

                        // Draw label background (scales with font size)
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                        ctx.fillRect(left, top - bgHeight, textWidth + bgPadding * 2, bgHeight);

                        ctx.fillStyle = '#ffffff';
                        ctx.font = `${fontSize}px Arial`;
                        ctx.fillText(label, left + 5, top - 5);
                    });
                }
            };
        }
    };

    useEffect(() => {
        if (image && results.length > 0){
            drawBoundingBoxes();
        }
    }, [image, results]);

    // Redraw bounding boxes when window resizes
    useEffect(() => {
        window.addEventListener('resize', drawBoundingBoxes);
        return () => {
            window.removeEventListener('resize', drawBoundingBoxes);
        };
    }, [image, results]);

    return (
        <div>
            <h1>Object Detection</h1>
            <h3>Select an image</h3>
            <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => e.target.files && uploadImage(e.target.files[0])}
            />

            {loading && <p>Loading...</p>}

            {image && (
                <div style={{ position: 'relative', marginTop: '20px' }}>
                    {/* Image element */}
                    <img 
                        ref={imageRef}
                        src={image}
                        alt="Uploaded image"
                        style={{ width: '100%', height: 'auto' }}
                    />

                    {/* Canvas for drawing bounding boxes */}
                    <canvas
                        ref={canvasRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: 'auto',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ObjectDetection;
