import React, { useState, useEffect, useRef } from 'react';
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

    useEffect(() => {
        if (image && results.length > 0 && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = image;

            img.onload = () => {
                if (ctx) {
                    // Ensure canvas size matches the image size
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Draw the image on the canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);

                    // Scaling factors for bounding boxes
                    const scaleX = canvas.width / img.width;
                    const scaleY = canvas.height / img.height;

                    // Draw bounding boxes
                    results.forEach((result) => {
                        const [x1, y1, x2, y2] = result.bbox;

                        // Calculate scaled dimensions for bounding box
                        const width = (x2 - x1) * img.width * scaleX;
                        const height = (y2 - y1) * img.height * scaleY;
                        const left = x1 * img.width * scaleX;
                        const top = y1 * img.height * scaleY;

                        // Draw bounding box on the canvas
                        ctx.beginPath();
                        ctx.rect(left, top, width, height);
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = 'green';
                        ctx.stroke();
                    });
                }
            };
        }
    }, [image, results]);

    return (
        <div>
            <h1>Object Detection</h1>
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
                        src={image}
                        alt="Uploaded image"
                        style={{ width: '100%', height: 'auto' }}
                    />

                    {/* Canvas for drawing bounding boxes */}
                    <canvas
                        ref={canvasRef}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    />
                </div>
            )}

            {(results.length > 0) && !loading && (
                <ul>
                    {results.map((result, index) => (
                        <li key={index}>
                            <p>{result.label}</p>
                            <p>Confidence: {result.confidence.toFixed(2)}</p>
                            <p>Bounding box: {result.bbox.join(', ')}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ObjectDetection;
