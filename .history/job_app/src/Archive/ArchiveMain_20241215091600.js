import React, { useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";  // react-dnd 라이브러리에서 useDrag 훅을 가져옴
import "./ArchiveMain.css";

// 드래그 가능한 이미지 컴포넌트
const DraggableImage = ({ id, src, width, height, initialX, initialY, onDragMove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "image", // 드래그 가능한 항목의 유형
    item: { id, initialX, initialY, width, height },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(), // 드래그 상태
    }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        // 드롭 시 좌표 업데이트
        onDragMove(item.id, item.initialX, item.initialY);
      }
    },
  }));

  return (
    <img
      ref={drag}
      src={src}
      alt={`Image ${id}`}
      style={{
        position: "absolute",
        top: `${initialY}px`,
        left: `${initialX}px`,
        width: `${width}px`,
        height: `${height}px`,
        opacity: isDragging ? 0.5 : 1,
        cursor: "move", // 드래그 가능 표시
        objectFit: "contain",
      }}
    />
  );
};

const ArchiveMain = () => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1); // 확대/축소 비율 상태
  const [images, setImages] = useState([]); // 이미지 정보 저장

  useEffect(() => {
    const numImages = 10; // 배치할 이미지 개수
    const newImages = [];
    const occupiedPositions = [];

    // 이미지 정보 배열에 추가
    for (let i = 1; i <= numImages; i++) {
      const randomX = Math.random() * 500; // 위치를 랜덤하게 설정
      const randomY = Math.random() * 500;
      const randomSize = Math.floor(Math.random() * 100) + 50; // 랜덤 크기 설정

      newImages.push({
        id: i,
        src: `/images/${i}.png`, // 이미지 소스
        width: randomSize,
        height: randomSize,
        initialX: randomX,
        initialY: randomY,
      });
      occupiedPositions.push({ x: randomX, y: randomY });
    }

    setImages(newImages);

    const container = containerRef.current;
    const handleWheel = (event) => {
      event.preventDefault(); // 기본 동작 방지 (페이지 스크롤 방지)
      
      // 확대/축소 비율 설정
      const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9; // 휠 위는 확대, 휠 아래는 축소
      setScale((prevScale) => {
        const newScale = prevScale * zoomFactor;
        return Math.min(Math.max(newScale, 0.5), 2); // 최소 0.5배, 최대 2배로 제한
      });
    };

    container.addEventListener("wheel", handleWheel);
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleDragMove = (id, newX, newY) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id ? { ...img, initialX: newX, initialY: newY } : img
      )
    );
  };

  return (
    <div
      ref={containerRef}
      className="archive-main"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        position: "relative", // 이미지가 절대 위치를 기준으로 배치될 수 있도록
      }}
    >
      {images.map((image) => (
        <DraggableImage
          key={image.id}
          id={image.id}
          src={image.src}
          width={image.width}
          height={image.height}
          initialX={image.initialX}
          initialY={image.initialY}
          onDragMove={handleDragMove}
        />
      ))}
    </div>
  );
};

export default ArchiveMain;
