import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import './ArchiveMain.css';

const ArchiveMain = () => {
  const canvasRef = useRef(null); // 부모 div 참조

  useEffect(() => {
    const { Engine, Render, World, Bodies, Mouse, MouseConstraint } = Matter;

    const engine = Engine.create();
    const world = engine.world;

    // 렌더러 생성
    const render = Render.create({
      element: canvasRef.current, // div 안에 canvas를 넣음
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#f5f5f5',
      },
    });

    const boxes = [];
    for (let i = 0; i < 5; i++) {
      const box = Bodies.rectangle(
        200 + i * 150,
        200 + Math.random() * 100,
        100, 100,
        {
          restitution: 0.5,
          render: {
            fillStyle: 'blue',
          },
        }
      );
      boxes.push(box);
    }

    World.add(world, boxes);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    World.add(world, mouseConstraint);

    Engine.run(engine);
    Render.run(render);

    const handleResize = () => {
      render.options.width = window.innerWidth;
      render.options.height = window.innerHeight;
      Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: window.innerWidth, y: window.innerHeight },
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div className="archive-main" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* 렌더러가 canvas를 자동으로 생성하고 div 안에 삽입 */}
      <div ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
    </div>
  );
};

export default ArchiveMain;
