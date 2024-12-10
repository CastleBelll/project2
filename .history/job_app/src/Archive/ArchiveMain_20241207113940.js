import React, { useState, useEffect } from "react";
import "./ArchiveMain.css"; // CSS 파일 분리

const ArchiveMain = () => {
  const [squares, setSquares] = useState([]);
  const [lastSquareTime, setLastSquareTime] = useState(0); // 마지막 생성 시간 추적

  const handleMouseMove = (e) => {
    const now = Date.now();
    const cooldown = 45 // 박스 생성 간격(ms)
    
    if (now - lastSquareTime > cooldown) {
      const newSquare = {
        id: now, // 고유 ID 생성
        x: e.clientX,
        y: e.clientY,
        velocity: Math.random() * 2, // 초기 속도 (자연스러운 시작)
        rotation: 0, // 초기 회전각
        rotationSpeed: Math.random() * 2 - 1, // 랜덤 회전 속도
        dx: 0, // x축 이동 속도
        dy: 0, // y축 이동 속도
      };

      setSquares((prevSquares) => [...prevSquares, newSquare]);
      setLastSquareTime(now); // 마지막 생성 시간 업데이트
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSquares((prevSquares) => {
        const updatedSquares = prevSquares.map((square) => {
          const newY = square.y + square.velocity;
          const newVelocity = newY + 100 >= window.innerHeight ? 0 : square.velocity + 0.3; // 점진적 중력 가속도
          const newRotation = square.rotation + square.rotationSpeed; // 회전 업데이트
          return {
            ...square,
            y: Math.min(newY, window.innerHeight - 100), // 바닥에 쌓이기
            velocity: newVelocity,
            rotation: newRotation,
          };
        });

        // 충돌 감지 및 처리
        for (let i = 0; i < updatedSquares.length; i++) {
          for (let j = i + 1; j < updatedSquares.length; j++) {
            const squareA = updatedSquares[i];
            const squareB = updatedSquares[j];

            const dx = squareA.x - squareB.x;
            const dy = squareA.y - squareB.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) { // 정사각형 크기가 100px이므로 거리 체크
              const overlap = 90 - distance;
              const angle = Math.atan2(dy, dx);

              // 부드럽게 밀어내기 위한 속도 계산
              const pushX = Math.cos(angle) * (overlap / 2);
              const pushY = Math.sin(angle) * (overlap / 2);

              updatedSquares[i] = {
                ...squareA,
                x: squareA.x + pushX * 0.5,
                y: squareA.y + pushY * 0.5,
              };
              updatedSquares[j] = {
                ...squareB,
                x: squareB.x - pushX * 0.5,
                y: squareB.y - pushY * 0.5,
              };
            }
          }
        }

        return updatedSquares;
      });
    }, 20); // 약 60fps

    return () => clearInterval(interval);
  }, []);

  return (
    //onMouseMove={handleMouseMove}
    <div className="ArchiveMain" >
      {squares.map((square) => (
        <div
          key={square.id}
          className="square"
          style={{
            left: square.x,
            top: square.y,
            width: 100,
            height: 100,
            position: "absolute",
            transform: `rotate(${square.rotation}deg)`, // 회전 추가
            backgroundColor: "#007bff", // 사각형 색상
          }}
        />
      ))}
    </div>
  );
};

export default ArchiveMain;
