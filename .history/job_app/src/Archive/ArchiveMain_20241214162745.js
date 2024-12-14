import React from "react";
import "./ArchiveMain.css"; // CSS 파일 분리

const ArchiveMain = () => {
  const images = ["1.png", "2.png", "3.png", "4.png", "5.png"]; // 이미지 파일 이름 배열

  // 이미지의 랜덤한 위치를 생성하는 함수
  const getRandomPosition = () => {
    const randomX = Math.floor(Math.random() * 80) + 10; // X 위치 (10% ~ 90%)
    const randomY = Math.floor(Math.random() * 80) + 10; // Y 위치 (10% ~ 90%)
    return { top: `${randomY}%`, left: `${randomX}%` };
  };

  return (
    <div className="archive-main">
      {images.map((image, index) => {
        const randomPosition = getRandomPosition(); // 각 이미지마다 랜덤 위치 생성
        return (
          <img
            key={index}
            src={`/${image}`} // public 폴더 기준 경로
            alt={`Random ${index}`}
            className="archive-image"
            style={{
              position: "absolute",
              ...randomPosition, // 랜덤 위치 스타일 적용
            }}
          />
        );
      })}
    </div>
  );
};

export default ArchiveMain;
