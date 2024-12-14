import React, { useEffect, useRef, useState, useCallback } from "react";
import { Engine, Render, World, Bodies, Events, Runner, Mouse, MouseConstraint, Query } from "matter-js";
import { BsArrowRight } from 'react-icons/bs';
import "./Generator.css";

const Generator = () => {
  const containerRef = useRef(null);
  const textElementsRef = useRef([]);
  const debounceTimer = useRef(null);
  const [data, setData] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [clickedTexts, setClickedTexts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [clickedData, setClickedData] = useState([]);

  const toggleOpen = () => {
    setIsOpen(false);
    setClickedTexts([]);
    setClickedData([]);

    textElementsRef.current.forEach(({ body }) => {
      body.render.fillStyle = "#242424";
      body.render.strokeStyle = "#ffffff";
      body.clicked = false;
    });
  };

  useEffect(() => {
    if (clickedTexts.length === 0) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [clickedTexts]);

  useEffect(() => {
    fetch("/json/images.json")
      .then((response) => response.json())
      .then((jsonData) => {
        const data = jsonData.map((item) => ({
          image: item.image,
          title: item.title,
          description: item.description,
          category: item.category,
          items: Object.keys(item.category).reduce((acc, category) => {
            item.category[category].forEach((subItem) => {
              acc.push(subItem);
            });
            return acc;
          }, []),
        }));
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

  const getClickedData = useCallback(() => {
    if (clickedTexts.length === 0) return [];

    const clickedData = data.filter((item) => {
      return clickedTexts.every((text) => {
        return Object.values(item.category).flat().includes(text);
      });
    });

    const randomItem = clickedData[Math.floor(Math.random() * clickedData.length)];

    if (!randomItem) {
      setIsOpen(false);
    }

    return randomItem ? [randomItem] : [];
  }, [clickedTexts, data]);

  const handleSquareClick = useCallback((body) => {
    console.log(`사각형 클릭됨: ${body.label}`);
    const clickedData = getClickedData();
    console.log("클릭된 데이터:", clickedData);
    setClickedData(clickedData);
  }, [getClickedData]);

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

        const conditionWidth = containerRect.width * 0.8;
        const conditionTop = 80;
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

              handleSquareClick(body);
            } else {
              body.render.strokeStyle = "#ffffff";
              body.render.fillStyle = "#242424";
              textElementsRef.current.find((item) => item.body === body).clicked = false;

              setClickedTexts((prev) => {
                const newClickedTexts = prev.filter((text) => text !== body.label);
                return newClickedTexts;
              });

              handleSquareClick(body);
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
  }, [data, canvasSize, handleSquareClick]);

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



  const handleCircleClick = () => {
    const newClickedData = getClickedData();
    setClickedData(newClickedData);
  };



  return (
    <>
      <div className="Generator" ref={containerRef}></div>
      <div className={`event-arial ${isOpen ? "shrink" : ""}`}>
        Drop Zone
      </div>
      <div className={`generator-arial ${isOpen ? "open" : "not-open"}`}>
        <div className="main-container">
          <div className="left-container d-flex justify-content-center align-items-center">
            {isOpen && (
              <BsArrowRight onClick={toggleOpen} style={{ fontSize: '24px' }} />
            )}
          </div>
          <div className="content-container">
            <div className="image-container">
              {clickedData.map((item, index) => (
                <img key={index} src={`/images/${item.image}`} alt={item.title} />
              ))}
            </div>
            <div className="text-container">
              {clickedData.map((item, index) => (
                <div key={index} className="text-item">
                  <div className="title-container">
                    <div className="title">{item.title}</div>
                  </div>
                  <div className="category-container">
                    {Object.values(item.category)
                      .flat()
                      .filter(category => category.trim() !== "") 
                      .map((category, index) => (
                        <div key={index} className="category-item">{category}</div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="right-container">
          </div>
        </div>
        <div className="circle" onClick={handleCircleClick}>
          <img onClick={handleCircleClick} src="/Vector.png" alt="Vector" />
        </div>
      </div>
    </>
  );
};

export default Generator;
