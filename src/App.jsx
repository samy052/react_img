import { useState, useRef, useEffect } from 'react';
import { Form, Button, Dropdown } from 'react-bootstrap';
import axios from "axios";
import './index.css';
import React from "react";

const API_URL = "https://api.unsplash.com/search/photos";
const IMAGES_PER_PAGE = 4;

const App = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const searchInput = useRef(null);
  const canvasRef = useRef(null);
  const [fabricInstance, setFabricInstance] = useState(null);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchImages();
  };

  const fetchImages = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}?query=${searchInput.current.value}&page=1&per_page=${IMAGES_PER_PAGE}&client_id=wk8X-2SuiFjWUBy--UzuNXwMhzMMakRAzo4RD3ZsB7k`
      );
      setImages(data.results);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddCaptions = async (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const addTextLayer = () => {
    if (fabricInstance) {
      const text = new fabric.IText('Editable Text', {
        left: 100,
        top: 100,
        fontSize: 24,
        fill: 'black',
      });
      fabricInstance.add(text);
    }
  };

  const addShape = (shape) => {
    if (!fabricInstance) return;

    let shapeObject;
    switch (shape) {
      case 'rectangle':
        shapeObject = new fabric.Rect({
          left: 100,
          top: 150,
          fill: 'blue',
          width: 100,
          height: 50,
        });
        break;
      case 'circle':
        shapeObject = new fabric.Circle({
          left: 150,
          top: 200,
          fill: 'red',
          radius: 50,
        });
        break;
      case 'triangle':
        shapeObject = new fabric.Triangle({
          left: 200,
          top: 250,
          fill: 'green',
          width: 100,
          height: 100,
        });
        break;
      case 'polygon':
        shapeObject = new fabric.Polygon([
          { x: 200, y: 100 },
          { x: 250, y: 150 },
          { x: 220, y: 180 },
          { x: 180, y: 150 },
        ], {
          left: 300,
          top: 300,
          fill: 'yellow',
        });
        break;
      default:
        return;
    }
    fabricInstance.add(shapeObject);
  };

  useEffect(() => {
    const loadFabricCanvas = async () => {
      if (selectedImage && canvasRef.current) {
        const { fabric } = await import('fabric'); // Dynamically import fabric
        const canvas = new fabric.Canvas(canvasRef.current);

        // Add image to canvas
        fabric.Image.fromURL(selectedImage, (img) => {
          canvas.add(img);
          canvas.setWidth(500);  // Adjust canvas size
          canvas.setHeight(400);
          canvas.renderAll();
        });

        // Set fabricInstance to the canvas for further use
        setFabricInstance(canvas);

        // Enable drag, resize, and layer functionality for all elements
        canvas.on('object:selected', (e) => {
          e.target.set({
            borderColor: 'red',
            cornerColor: 'green',
            cornerSize: 6,
            transparentCorners: false,
          });
        });
      }
    };

    loadFabricCanvas();
  }, [selectedImage]);

  // Function to download canvas as an image
  const downloadCanvasAsImage = () => {
    if (fabricInstance) {
      const dataURL = fabricInstance.toDataURL({
        format: 'png',
        quality: 1,
      });

      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'canvas-image.png'; // Filename for the download
      link.click(); // Trigger download
    }
  };

  return (
    <div className='container'>
      <h1 className='title'>Search Page</h1>
      <div className='search-section'>
        <Form onSubmit={handleSearch}>
          <Form.Control
            type='search'
            placeholder='ENTER YOUR SEARCH TERM...'
            className='search-input'
            ref={searchInput}
          />
        </Form>
      </div>

      <div className='images'>
        {images.map((image) => (
          <div key={image.id} className='image-container'>
            <img
              src={image.urls.small}
              alt={image.alt_description}
              className='image'
            />
            <Button onClick={() => handleAddCaptions(image.urls.regular)}>
              Add Captions
            </Button>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className='canvas-section'>
          <h2>Canvas Editor</h2>
          <Button onClick={addTextLayer}>Add Text Layer</Button>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Add Shape
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => addShape('rectangle')}>Rectangle</Dropdown.Item>
              <Dropdown.Item onClick={() => addShape('circle')}>Circle</Dropdown.Item>
              <Dropdown.Item onClick={() => addShape('triangle')}>Triangle</Dropdown.Item>
              <Dropdown.Item onClick={() => addShape('polygon')}>Polygon</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <canvas ref={canvasRef} id='canvas' width={500} height={400} />

          {/* Download Button */}
          <Button onClick={downloadCanvasAsImage} className="mt-3">
            Download Canvas as Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default App;
