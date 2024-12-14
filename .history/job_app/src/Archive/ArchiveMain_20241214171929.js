import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import './ArchiveMain.css';

const ArchiveMain = () => {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hitRectangles, setHitRectangles] = useState([]); // 마우스와 일치하는 사각형을 추적

  useEffect(() => {
    // Matter.js 엔진과 관련된 객체 초기화
    const { Engine, Render, World, Bodies, Mouse, MouseConstraint } = Matter;

    // 엔진과 월드 생성
    const engine = Engine.create();
    const world = engine.world;

    // 렌더러 생성 (이제 캔버스를 'canvas'로 설정)
    const render = Render.create({
      element: canvasRef.current, // Matter.js 렌더러에 사용될 canvas를 지정
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false, // 물리적 객체의 경계를 보여주지 않음
        background: '#f5f5f5', // 배경색
      },
    });

    // 사각형 객체들 생성
    const boxes = [];
    for (let i = 0; i < 5; i++) {
      const box = Bodies.rectangle(
        200 + i * 150,  // x 위치
        200 + Math.random() * 100, // y 위치
        100, 100, // 너비와 높이
        {
          restitution: 0.5, // 반발력 설정
          render: {
            fillStyle: 'blue', // 색상
          },
        }
      );
      boxes.push({
        ...box,
        name: `Rect ${i + 1}`, // 사각형에 이름 추가
      });
    }

    // 월드에 사각형들 추가
    World.add(world, boxes);

    // 마우스 컨트롤
    const mouse = Mouse.create(render.canvas); // render.canvas가 실제 마우스를 처리하는 캔버스를 가리킴
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    World.add(world, mouseConstraint);

    // 엔진 업데이트
    Engine.run(engine);
    Render.run(render);

    // 마우스 위치 업데이트
    const handleMouseMove = (event) => {
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      setMousePosition({ x: mouseX, y: mouseY });

      // 마우스와 사각형이 일치하는지 확인
      const hitRects = boxes.filter((rect) => {
        // 사각형의 실제 위치 계산 (Matter.js에서 각 rect는 position.x와 position.y로 위치가 정의됨)
        const rectX = rect.position.x;
        const rectY = rect.position.y;
        return (
          mouseX > rectX - rect.width / 2 &&
          mouseX < rectX + rect.width / 2 &&
          mouseY > rectY - rect.height / 2 &&
          mouseY < rectY + rect.height / 2
        );
      });
      setHitRectangles(hitRects);
    };

    // 마우스 이벤트 처리
    render.canvas.addEventListener('mousemove', handleMouseMove);

    // 창 크기 변경 시 렌더러 크기 조정
    const handleResize = () => {
      render.options.width = window.innerWidth;
      render.options.height = window.innerHeight;
      Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: window.innerWidth, y: window.innerHeight },
      });
    };
    window.addEventListener('resize', handleResize);

    // 정리 함수
    return () => {
      window.removeEventListener('resize', handleResize);
      render.canvas.removeEventListener('mousemove', handleMouseMove);
      Render.stop(render);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div className="archive-main">
      <div ref={canvasRef} style={{ position: 'relative', width: '100%', height: '100%' }} />

      {/* 마우스 위치와 일치하는 사각형 표시 */}
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'black', fontSize: '16px' }}>
        <p>Mouse Position: ({mousePosition.x}, {mousePosition.y})</p>
        <div>
          {hitRectangles.length > 0 ? (
            <>
              <p>Intersecting with:</p>
              <ul>
                {hitRectangles.map((rect, index) => (
                  <li key={index}>{rect.name}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>No intersection</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveMain;
