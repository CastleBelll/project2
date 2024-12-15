import React, { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./ArchiveMain.css";

const DraggableImage = ({ id, left, top, size }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "image",
    item: { id, left, top, size },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <img
      ref={drag}
      src={`/images/${id}.png`} // 이미지 경로 설정
      alt={`Image ${id}`}
      className="archive-image"
      style={{
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(-${size / 2}px, -${size / 2}px)`,
        opacity: isDragging ? 0.5 : 1,
        objectFit: "contain",
      }}
    />
  );
};

const ArchiveMain = () => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1); // 확대/축소 비율 상태
  const [images, setImages] = useState([]);

  useEffect(() => {
    const numImages = 10; // 배치할 이미지 개수
    const newImages = [];

    for (let i = 1; i <= numImages; i++) {
      const randomX = Math.random() * window.innerWidth;
      const randomY = Math.random() * window.innerHeight;
      const randomSize = Math.floor(Math.random() * 100) + 50;
      newImages.push({
        id: i,
        left: randomX,
        top: randomY,
        size: randomSize,
      });
    }

    setImages(newImages);
  }, []);

  // 마우스 휠 이벤트 처리 (컨테이너의 배율 변경)
  const handleWheel = (event) => {
    event.preventDefault(); // 기본 동작 방지 (페이지 스크롤 방지)
    
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9; // 휠 위는 확대, 휠 아래는 축소
    setScale((prevScale) => {
      const newScale = prevScale * zoomFactor;
      return Math.min(Math.max(newScale, 0.5), 2);
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        ref={containerRef}
        className="archive-main"
        onWheel={handleWheel}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center", // 확대 시 중심점 설정
          position: "relative",
          width: "100vw",
          height: "100vh",
        }}
      >
        {images.map(({ id, left, top, size }) => (
          <DraggableImage
            key={id}
            id={id}
            left={left}
            top={top}
            size={size}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default ArchiveMain;
