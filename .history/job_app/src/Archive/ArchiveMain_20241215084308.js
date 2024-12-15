import React, { useEffect, useRef } from "react";
import "./ArchiveMain.css";

const ArchiveMain = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const numImages = 5; // 배치할 이미지 개수
    const images = [];

    for (let i = 1; i <= numImages; i++) {
      const img = document.createElement("img");
      img.src = `/images/${i}.png`; // public/images 폴더 내 1.png, 2.png 등의 파일
      img.alt = `Image ${i}`;
      img.className = "archive-image";
      img.style.objectFit = "contain"; // 비율 유지
      let randomX, randomY;
      let isOverlapping;
      // 랜덤 위치 지정 (이미지 간 겹치지 않도록 조정)
      do {
        randomX = Math.random() * 100; // 0% ~ 100%
        randomY = Math.random() * 100; // 0% ~ 100%

        isOverlapping = occupiedPositions.some(pos => {
          const distance = Math.sqrt(
            Math.pow(randomX - pos.x, 2) + Math.pow(randomY - pos.y, 2)
          );
          return distance < 10; // 최소 거리 (10% 기준) 설정
        });
      } while (isOverlapping);

      occupiedPositions.push({ x: randomX, y: randomY });

      // 랜덤 크기 지정 (50px ~ 150px)
      const randomSize = Math.floor(Math.random() * 100) + 50;
      img.style.width = `${randomSize}px`;
      img.style.height = `${randomSize}px`;

      // 위치 설정
      img.style.top = `${randomY}%`;
      img.style.left = `${randomX}%`;

      // 중앙에서 벗어난 보정 (이미지 크기 반영)
      img.style.transform = `translate(-${randomSize / 2}px, -${randomSize / 2}px)`;

      images.push(img);
      container.appendChild(img);
    }

    return () => {
      // 컴포넌트 언마운트 시 이미지 제거
      images.forEach(img => container.removeChild(img));
    };
  }, []);

  return <div ref={containerRef} className="archive-main"></div>;
};

export default ArchiveMain;
