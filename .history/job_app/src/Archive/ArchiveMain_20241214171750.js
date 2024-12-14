import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import './ArchiveMain.css';

const ArchiveMain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Matter.js 엔진과 관련된 객체 초기화
    const { Engine, Render, World, Bodies, Mouse, MouseConstraint } = Matter;

    // 엔진과 월드 생성
    const engine = Engine.create();
    const world = engine.world;

    // 렌더러 생성
    const render = Render.create({
      element: canvasRef.current, // canvasRef는 div가 아닌 'canvas' 엘리먼트를 참조해야 함
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
      boxes.push(box);
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
      Render.stop(render);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div className="archive-main">
      {/* 이 div는 렌더링된 canvas를 감싸고 있어야 하지만, 실제로 canvas는 Matter.js에서 직접 관리합니다 */}
      <div ref={canvasRef} style={{ position: 'relative', width: '100%', height: '100%' }} />
    </div>
  );
};

export default ArchiveMain;
