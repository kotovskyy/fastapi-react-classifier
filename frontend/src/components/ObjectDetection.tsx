import React, { useState, useEffect } from 'react';
import api from '../utils/api';

interface DetectionResult {
    label: string;
    confidence: number;
    bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

const ObjectDetection: React.FC = () => {
    const [results, setResults] = useState<DetectionResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const uploadImage = async (file: File) => {
        setLoading(true);
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

    return (
        <div>
            <h1>Object Detection</h1>
            <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => e.target.files && uploadImage(e.target.files[0])}
            />

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    {results.length > 0 ? (
                        <ul>
                            {results.map((result, index) => (
                                <li key={index}>
                                    <p>{result.label}</p>
                                    <p>Confidence: {result.confidence.toFixed(2)}</p>
                                    <p>Bounding box: {result.bbox.join(', ')}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No results to display</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ObjectDetection;
