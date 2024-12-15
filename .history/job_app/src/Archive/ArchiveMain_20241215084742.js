import React, { useEffect, useRef } from "react";
import "./ArchiveMain.css";

const ArchiveMain = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const numImages = 10; // 배치할 이미지 개수
    const images = [];

    const occupiedPositions = []; // 이미지가 이미 배치된 위치 저장

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

      // 드래그 앤 드롭 기능 추가
      img.draggable = true;
      
      let offsetX = 0;
      let offsetY = 0;

      img.addEventListener("dragstart", (event) => {
        offsetX = event.offsetX;
        offsetY = event.offsetY;
        event.dataTransfer.setData("text/plain", "");
        event.target.style.transition = "none"; // 드래그 시작 시 애니메이션 제거
      });

      img.addEventListener("drag", (event) => {
        // 드래그 중 실시간으로 위치 갱신
        if (event.clientX && event.clientY) {
          const newLeft = event.clientX - container.offsetLeft - offsetX;
          const newTop = event.clientY - container.offsetTop - offsetY;

          img.style.left = `${newLeft}px`;
          img.style.top = `${newTop}px`;
        }
      });

      img.addEventListener("dragend", (event) => {
        event.target.style.transition = "all 0.1s ease"; // 드래그 종료 후 애니메이션 복원
        const newLeft = event.clientX - container.offsetLeft - offsetX;
        const newTop = event.clientY - container.offsetTop - offsetY;

        img.style.left = `${newLeft}px`;
        img.style.top = `${newTop}px`;
      });

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
