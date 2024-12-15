import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useDrag } from "react-dnd";  // useDrop 제거
import { OrbitControls } from "@react-three/drei";
import "./ArchiveMain.css";

// DraggableImage 컴포넌트
const DraggableImage = ({ id, position, size }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "image",
    item: { id, position, size },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <mesh
      ref={drag}
      position={position}
      scale={[size, size, 1]}
      rotation={[0, 0, 0]}
      castShadow
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={new THREE.TextureLoader().load(`/images/${id}.png`)}
        transparent={true}
        opacity={isDragging ? 0.5 : 1}
      />
    </mesh>
  );
};

const ArchiveMain = () => {
  const [images, setImages] = useState([]);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const numImages = 10;
    const newImages = [];

    for (let i = 1; i <= numImages; i++) {
      const randomX = Math.random() * 10 - 5;
      const randomY = Math.random() * 10 - 5;
      const randomSize = Math.random() * 1 + 0.5;
      newImages.push({
        id: i,
        position: [randomX, randomY, 0],
        size: randomSize,
      });
    }

    setImages(newImages);
  }, []);

  const handleWheel = (event) => {
    event.preventDefault();
    
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    setScale((prevScale) => {
      const newScale = prevScale * zoomFactor;
      return Math.min(Math.max(newScale, 0.5), 2);
    });
  };

  return (
    <div
      className="archive-main"
      onWheel={handleWheel}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f0f0f0",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        onWheel={handleWheel}
        style={{ width: "100%", height: "100%" }}
      >
        <OrbitControls />
        {images.map(({ id, position, size }) => (
          <DraggableImage key={id} id={id} position={position} size={size} />
        ))}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
      </Canvas>
    </div>
  );
};

export default ArchiveMain;
