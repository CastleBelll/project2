import React, { useEffect, useRef, useState } from "react";
import { Engine, Render, World, Bodies, Events, Runner, Mouse, MouseConstraint, Query } from "matter-js";
import "./Generator.css";

const Generator = () => {
  const containerRef = useRef(null);
  const textElementsRef = useRef([]);
  const debounceTimer = useRef(null);
  const [data, setData] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [clickedTexts, setClickedTexts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (clickedTexts.length === 0) {
      setIsOpen(false); // 배열이 비어 있으면 "open" 상태 비활성화
    } else {
      setIsOpen(true); // 배열에 값이 있으면 "open" 상태 활성화
    }
  }, [clickedTexts]);

  useEffect(() => {
    fetch("/json/images.json")
      .then((response) => response.json())
      .then((jsonData) => {
        const data = jsonData.map((item) => ({
          image: item.image,  // image 필드 추가
          title: item.title,  // title 필드 추가
          description: item.description,  // description 필드 추가
          category: item.category,  // category 필드 유지
          items: Object.keys(item.category).reduce((acc, category) => {
            item.category[category].forEach((subItem) => {
              acc.push(subItem);
            });
            return acc;
          }, []),
        }));
        console.log(data);
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching the JSON file:", error);
      });
  }, []);

  useEffect(() => {
    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (container) {
        setCanvasSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    updateCanvasSize();

    window.addEventListener("resize", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    const engine = Engine.create();
    const world = engine.world;
    engine.world.gravity.y = 1;

    const render = Render.create({
      element: container,
      engine: engine,
      options: {
        width: canvasSize.width,
        height: canvasSize.height,
        wireframes: false,
        background: "transparent",
        pixelRatio: window.devicePixelRatio || 1,
      },
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    const width = canvasSize.width;
    const height = canvasSize.height;
    const wallThickness = 10;

    const topWall = Bodies.rectangle(width / 2, 0 - wallThickness / 2, width, wallThickness, {
      isStatic: true,
      render: { fillStyle: "#ffffff" },
    });
    const bottomWall = Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, {
      isStatic: true,
      render: { fillStyle: "#ffffff" },
    });
    const leftWall = Bodies.rectangle(0 - wallThickness / 2, height / 2, wallThickness, height, {
      isStatic: true,
      render: { fillStyle: "#ffffff" },
    });
    const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, {
      isStatic: true,
      render: { fillStyle: "#ffffff" },
    });

    World.add(world, [topWall, bottomWall, leftWall, rightWall]);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0,
        render: { visible: false },
      },
    });
    World.add(world, mouseConstraint);

    const handleMouseMove = (e) => {
      if (data.length === 0) return;

      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const container = containerRef.current;

        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const mousePos = mouse.position;

        const mouseCanvasX = mousePos.x - containerRect.left;
        const mouseCanvasY = mousePos.y - containerRect.top;

        // 화면 조건 확인 (너비의 80%, 높이의 top에서 80px 떨어진 높이의 20%)
        const conditionWidth = containerRect.width * 0.8;
        const conditionTop = 80; // top에서 80px
        const conditionHeight = containerRect.height * 0.2;

        const isMouseInTargetArea =
          mouseCanvasX <= conditionWidth &&
          mouseCanvasY >= conditionTop &&
          mouseCanvasY <= conditionTop + conditionHeight;

        if (isMouseInTargetArea) {
          const randomCategory = data[Math.floor(Math.random() * data.length)];
          const randomItem = randomCategory.items[Math.floor(Math.random() * randomCategory.items.length)] || "";

          if (randomItem !== "") {
            const isAlreadyRendered = textElementsRef.current.some(({ body }) => body.label === randomItem);
            if (isAlreadyRendered) {
              return;
            }

            const size = getRectangleSize(randomItem);
            const angle = (Math.random() - 0.5) * Math.PI;

            const newRectangle = Bodies.rectangle(mouseCanvasX, mouseCanvasY, size.width, size.height, {
              angle: angle,
              chamfer: {
                radius: [20, 20, 20, 20],
              },
              render: {
                fillStyle: "#242424",
                strokeStyle: "#ffffff",
                lineWidth: 2,
              },
              restitution: 0.3,
              friction: 0.05,
              frictionAir: 0.05,
              collisionFilter: {
                group: 1,
              },
              label: randomItem,
            });

            World.add(world, newRectangle);
            textElementsRef.current.push({ body: newRectangle, clicked: false });
          }
        }
      },);
    };
    container.addEventListener("mousemove", handleMouseMove);

    let isClicking = false;

    Events.on(engine, "beforeUpdate", () => {
      const mousePos = mouse.position;
      const hoveredBody = Query.point(textElementsRef.current.map(({ body }) => body), mousePos);

      textElementsRef.current.forEach(({ body }) => {
        if (hoveredBody.includes(body)) {
          body.render.strokeStyle = "#9746ff";
        } else {
          body.render.strokeStyle = "#ffffff";
        }
      });

      if (mouseConstraint.mouse.button === 0 && !isClicking) {
        isClicking = true;

        textElementsRef.current.forEach(({ body, clicked }) => {
          if (hoveredBody.includes(body)) {
            if (!clicked) {
              body.render.fillStyle = "#9746ff";
              body.render.strokeStyle = "#9746ff";
              textElementsRef.current.find((item) => item.body === body).clicked = true;

              setClickedTexts((prev) => {
                const newClickedTexts = [...prev, body.label];
                return newClickedTexts;
              });
            } else {
              body.render.strokeStyle = "#ffffff";
              body.render.fillStyle = "#242424";
              textElementsRef.current.find((item) => item.body === body).clicked = false;

              setClickedTexts((prev) => {
                const newClickedTexts = prev.filter((text) => text !== body.label);
                return newClickedTexts;
              });
            }
          }
        });

        setTimeout(() => {
          isClicking = false;
        }, 300);
      }
    });

    Events.on(engine, "beforeUpdate", () => {
      textElementsRef.current = textElementsRef.current.filter(({ body }) => {
        const { x, y } = body.position;
        const isInBounds =
          x > -100 &&
          y > -100 &&
          x < render.options.width + 100 &&
          y < render.options.height + 100;

        if (!isInBounds) {
          World.remove(world, body);
          return false;
        }
        return true;
      });
    });

    Events.on(render, "afterRender", () => {
      const context = render.context;

      textElementsRef.current.forEach(({ body }) => {
        const { position, angle } = body;
        const randomItem = body.label;

        if (randomItem) {
          context.save();
          context.translate(position.x, position.y);
          context.rotate(angle);
          context.fillStyle = "#ffffff";
          context.lineWidth = 1;
          context.font = "16px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(randomItem, 0, 0);
          context.restore();
        }
      });
    });

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      container.removeEventListener("mousemove", handleMouseMove);
      textElementsRef.current = [];
      container.innerHTML = "";
    };
  }, [data, canvasSize]);

  const getRectangleSize = (text) => {
    const fontSize = 18;
    const paddingX = 18;
    const paddingY = 10;

    const textWidth = fontSize * text.length * 1;
    const textHeight = fontSize;

    return {
      width: textWidth + paddingX * 2,
      height: textHeight + paddingY * 2,
    };
  };

  const getClickedData = () => {
    console.log("Clicked Texts:", clickedTexts); // 클릭된 텍스트 로그

    if (clickedTexts.length === 0) {
      console.log("No clicked texts, returning empty array.");
      return []; // clickedTexts가 비어있으면 아무 것도 반환하지 않음
    }

    // 필터링: clickedTexts의 모든 항목을 포함하는 객체를 찾기
    const clickedData = data.filter((item) =>
      clickedTexts.every((text) =>
        Object.values(item.category).flat().includes(text)
      )
    );

    console.log("Filtered Clicked Data:", clickedData);

    // 객체 단위로 랜덤 선택
    const randomItem = clickedData[Math.floor(Math.random() * clickedData.length)];
    console.log("Randomly Selected Object:", randomItem);

    // 랜덤으로 선택된 객체를 반환
    return randomItem ? [randomItem] : [];
  };


  return (
    <>
      <div className="Generator" ref={containerRef}></div>
      <div className={`event-arial ${isOpen ? "shrink" : ""}`}>
        Drop Zone
      </div>
      <div
        className={`generator-arial ${isOpen ? "open" : "not-open"}`}
        onClick={toggleOpen}
      >
        <div className="main-container">
        <div className="content-container">
          <div className="image-container">
            {getClickedData().map((item, index) => (
              <img key={index} src={`/images/${item.image}`} alt={item.title} />
            ))}
          </div>
          <div className="text-container">
            {getClickedData().map((item, index) => (
              <div key={index}>
                <h4>{item.title}</h4>
                <p>{Object.values(item.category).flat().join(", ")}</p>
                </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Generator;
