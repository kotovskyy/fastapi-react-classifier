import { useState } from 'react';
import './App.css';
import ObjectDetection from './components/ObjectDetection';

function App() {
  return (
    <div className="App">
      <h1>Welcome to the Object Detection App</h1>
      <ObjectDetection />
    </div>
  )
}

export default App
