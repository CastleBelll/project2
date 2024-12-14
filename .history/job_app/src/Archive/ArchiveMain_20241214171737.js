import React, { useEffect, useRef, useState } from 'react';
import './ArchiveMain.css';

const ArchiveMain = () => {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(false); // 드래그 상태 추적
  const [draggedRect, setDraggedRect] = useState(null); // 드래그 중인 사각형 정보
  const [rectangles, setRectangles] = useState([
    { x: 200, y: 200, width: 100, height: 100, color: 'blue' },
    { x: 400, y: 300, width: 100, height: 100, color: 'green' },
    { x: 600, y: 200, width: 100, height: 100, color: 'red' },
  ]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // 마우스 위치 상태

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 캔버스 크기 설정
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 사각형 그리기 함수
    const drawRectangles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 지우기

      // 사각형들 그리기
      rectangles.forEach(rect => {
        ctx.fillStyle = rect.color;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      });

      // 마우스 위치 그리기
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(`Mouse Position: (${mousePosition.x}, ${mousePosition.y})`, 20, 30);

      // 각 사각형 위치 그리기
      rectangles.forEach((rect, index) => {
        ctx.fillText(`Rect ${index + 1}: (${rect.x}, ${rect.y})`, 20, 50 + index * 20);
      });
    };

    // 마우스 이벤트 처리
    const handleMouseDown = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // 클릭한 위치에 있는 사각형을 찾기
      const clickedRect = rectangles.find(
        (rect) =>
          mouseX > rect.x && mouseX < rect.x + rect.width && mouseY > rect.y && mouseY < rect.y + rect.height
      );

      if (clickedRect) {
        setDragging(true);
        setDraggedRect(clickedRect);
      }
    };

    const handleMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      setMousePosition({ x: mouseX, y: mouseY }); // 마우스 위치 갱신

      if (dragging && draggedRect) {
        const newRectangles = rectangles.map((rect) =>
          rect === draggedRect
            ? {
                ...rect,
                x: e.clientX - draggedRect.width / 2, // 마우스 위치에 맞춰 사각형 이동
                y: e.clientY - draggedRect.height / 2,
              }
            : rect
        );
        setRectangles(newRectangles);
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
      setDraggedRect(null);
    };

    // 이벤트 리스너 추가
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    // 애니메이션 프레임을 통해 최적화된 그리기 처리
    const animate = () => {
      drawRectangles();
      requestAnimationFrame(animate);
    };

    animate(); // 애니메이션 시작

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, draggedRect, rectangles, mousePosition]);

  return (
    <div className="archive-main">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ArchiveMain;
