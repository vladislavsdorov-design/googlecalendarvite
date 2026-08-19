import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const PaymentNotification = () => {
  const [pos1, setPos1] = useState({ x: 50, y: 50 });
  const [pos2, setPos2] = useState({ x: 300, y: 100 });
  const [pos3, setPos3] = useState({ x: 150, y: 300 });
  const [vel1, setVel1] = useState({ x: 2.8, y: 2.3 });
  const [vel2, setVel2] = useState({ x: -2.5, y: 3.1 });
  const [vel3, setVel3] = useState({ x: 3.2, y: -2.7 });
  const [show, setShow] = useState(true);
  const [flash, setFlash] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const [screenFlashColor, setScreenFlashColor] = useState("");

  // Размеры квадратов (увеличиваются)
  const [size1, setSize1] = useState(200);
  const [size2, setSize2] = useState(200);
  const [size3, setSize3] = useState(200);
  const MAX_SIZE = 400; // Максимальный размер
  const GROWTH_RATE = 0.15; // Скорость роста

  // Мигание красным для квадратов
  useEffect(() => {
    const interval = setInterval(() => {
      setFlash((f) => !f);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Увеличение квадратов
  useEffect(() => {
    const growInterval = setInterval(() => {
      setSize1((prev) => Math.min(prev + GROWTH_RATE, MAX_SIZE));
      setSize2((prev) => Math.min(prev + GROWTH_RATE, MAX_SIZE));
      setSize3((prev) => Math.min(prev + GROWTH_RATE, MAX_SIZE));
    }, 50); // Обновление каждые 50мс для плавности

    return () => clearInterval(growInterval);
  }, []);

  // Мигание экрана каждые 40 секунд
  useEffect(() => {
    let flashTimeout;

    const startScreenFlash = () => {
      setScreenFlash(true);
      setScreenFlashColor("blue");

      setTimeout(() => {
        setScreenFlashColor("red");

        setTimeout(() => {
          setScreenFlash(false);
          setScreenFlashColor("");
          flashTimeout = setTimeout(startScreenFlash, 40000);
        }, 400);
      }, 400);
    };

    flashTimeout = setTimeout(startScreenFlash, 40000);
    return () => clearTimeout(flashTimeout);
  }, []);

  // Анимация для первого квадрата
  useEffect(() => {
    let frame1;
    const move1 = () => {
      setPos1((p) => {
        let nx = p.x + vel1.x;
        let ny = p.y + vel1.y;
        const w = window.innerWidth - size1;
        const h = window.innerHeight - size1;

        if (nx <= 0) {
          setVel1((v) => ({ ...v, x: Math.abs(v.x) }));
          nx = 0;
        } else if (nx >= w) {
          setVel1((v) => ({ ...v, x: -Math.abs(v.x) }));
          nx = w;
        }

        if (ny <= 0) {
          setVel1((v) => ({ ...v, y: Math.abs(v.y) }));
          ny = 0;
        } else if (ny >= h) {
          setVel1((v) => ({ ...v, y: -Math.abs(v.y) }));
          ny = h;
        }

        return { x: nx, y: ny };
      });
      frame1 = requestAnimationFrame(move1);
    };
    move1();
    return () => cancelAnimationFrame(frame1);
  }, [vel1, size1]);

  // Анимация для второго квадрата
  useEffect(() => {
    let frame2;
    const move2 = () => {
      setPos2((p) => {
        let nx = p.x + vel2.x;
        let ny = p.y + vel2.y;
        const w = window.innerWidth - size2;
        const h = window.innerHeight - size2;

        if (nx <= 0) {
          setVel2((v) => ({ ...v, x: Math.abs(v.x) }));
          nx = 0;
        } else if (nx >= w) {
          setVel2((v) => ({ ...v, x: -Math.abs(v.x) }));
          nx = w;
        }

        if (ny <= 0) {
          setVel2((v) => ({ ...v, y: Math.abs(v.y) }));
          ny = 0;
        } else if (ny >= h) {
          setVel2((v) => ({ ...v, y: -Math.abs(v.y) }));
          ny = h;
        }

        return { x: nx, y: ny };
      });
      frame2 = requestAnimationFrame(move2);
    };
    move2();
    return () => cancelAnimationFrame(frame2);
  }, [vel2, size2]);

  // Анимация для третьего квадрата
  useEffect(() => {
    let frame3;
    const move3 = () => {
      setPos3((p) => {
        let nx = p.x + vel3.x;
        let ny = p.y + vel3.y;
        const w = window.innerWidth - size3;
        const h = window.innerHeight - size3;

        if (nx <= 0) {
          setVel3((v) => ({ ...v, x: Math.abs(v.x) }));
          nx = 0;
        } else if (nx >= w) {
          setVel3((v) => ({ ...v, x: -Math.abs(v.x) }));
          nx = w;
        }

        if (ny <= 0) {
          setVel3((v) => ({ ...v, y: Math.abs(v.y) }));
          ny = 0;
        } else if (ny >= h) {
          setVel3((v) => ({ ...v, y: -Math.abs(v.y) }));
          ny = h;
        }

        return { x: nx, y: ny };
      });
      frame3 = requestAnimationFrame(move3);
    };
    move3();
    return () => cancelAnimationFrame(frame3);
  }, [vel3, size3]);

  if (!show) return null;

  return (
    <>
      <style>
        {`
          @keyframes blinkRed {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.2; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
          @keyframes screenFlashBlue {
            0% { background: rgba(0, 0, 255, 0.4); }
            100% { background: rgba(0, 0, 255, 0); }
          }
          @keyframes screenFlashRed {
            0% { background: rgba(255, 0, 0, 0.4); }
            100% { background: rgba(255, 0, 0, 0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
        `}
      </style>

      {/* Мигание экрана */}
      {screenFlash && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9998,
            pointerEvents: "none",
            animation:
              screenFlashColor === "blue"
                ? "screenFlashBlue 0.4s ease-out"
                : "screenFlashRed 0.4s ease-out",
            background:
              screenFlashColor === "blue"
                ? "rgba(0, 0, 255, 0.4)"
                : "rgba(255, 0, 0, 0.4)",
          }}
        />
      )}

      {/* Первый квадрат */}
      <div
        style={{
          position: "fixed",
          left: pos1.x,
          top: pos1.y,
          zIndex: 9999,
          width: size1,
          height: size1,
          background: "rgba(10, 10, 10, 0.92)",
          border: `2px solid ${
            flash ? "rgba(255, 0, 0, 0.8)" : "rgba(0, 255, 0, 0.3)"
          }`,
          borderRadius: "12px",
          boxShadow: flash
            ? "0 0 30px rgba(255, 0, 0, 0.15), inset 0 0 30px rgba(255, 0, 0, 0.05)"
            : "0 0 20px rgba(0, 255, 0, 0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "border-color 0.15s ease, box-shadow 0.15s ease, width 0.05s linear, height 0.05s linear",
          backdropFilter: "blur(10px)",
          animation:
            "float 3s ease-in-out infinite, pulse 2s ease-in-out infinite",
          pointerEvents: "none", // Не кликабельно
        }}
      >
        <div
          style={{
            width: "100%",
            height: "65%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <iframe
            src="https://gifer.com/embed/xw"
            width="100%"
            height="100%"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              border: "none",
              borderRadius: "12px 12px 0 0",
            }}
            allowFullScreen
          />
        </div>
        <div
          style={{
            color: flash ? "#ff0000" : "#00ff00",
            fontSize: Math.min(size1 / 6, 40),
            fontWeight: "300",
            fontFamily: "monospace",
            textShadow: flash
              ? "0 0 30px rgba(255, 0, 0, 0.2)"
              : "0 0 20px rgba(0, 255, 0, 0.1)",
            animation: "blinkRed 0.3s infinite",
            padding: "8px 0",
            letterSpacing: "4px",
            width: "100%",
            textAlign: "center",
            background: "rgba(0, 0, 0, 0.6)",
            transition: "color 0.15s ease, font-size 0.05s linear",
          }}
        >
          300 :(
        </div>
      </div>

      {/* Второй квадрат */}
      <div
        style={{
          position: "fixed",
          left: pos2.x,
          top: pos2.y,
          zIndex: 9999,
          width: size2,
          height: size2,
          background: "rgba(10, 10, 10, 0.92)",
          border: `2px solid ${
            flash ? "rgba(255, 0, 0, 0.8)" : "rgba(0, 255, 0, 0.3)"
          }`,
          borderRadius: "12px",
          boxShadow: flash
            ? "0 0 30px rgba(255, 0, 0, 0.15), inset 0 0 30px rgba(255, 0, 0, 0.05)"
            : "0 0 20px rgba(0, 255, 0, 0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "border-color 0.15s ease, box-shadow 0.15s ease, width 0.05s linear, height 0.05s linear",
          backdropFilter: "blur(10px)",
          animation:
            "float 2.5s ease-in-out infinite reverse, pulse 2.5s ease-in-out infinite",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "65%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <iframe
            src="https://gifer.com/embed/bfR"
            width="100%"
            height="100%"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              border: "none",
              borderRadius: "12px 12px 0 0",
            }}
            allowFullScreen
          />
        </div>
        <div
          style={{
            color: flash ? "#ff0000" : "#00ff00",
            fontSize: Math.min(size2 / 6, 40),
            fontWeight: "300",
            fontFamily: "monospace",
            textShadow: flash
              ? "0 0 30px rgba(255, 0, 0, 0.2)"
              : "0 0 20px rgba(0, 255, 0, 0.1)",
            animation: "blinkRed 0.3s infinite",
            padding: "8px 0",
            letterSpacing: "4px",
            width: "100%",
            textAlign: "center",
            background: "rgba(0, 0, 0, 0.6)",
            transition: "color 0.15s ease, font-size 0.05s linear",
          }}
        >
          300 ;))
        </div>
      </div>

      {/* Третий квадрат */}
      <div
        style={{
          position: "fixed",
          left: pos3.x,
          top: pos3.y,
          zIndex: 9999,
          width: size3,
          height: size3,
          background: "rgba(10, 10, 10, 0.92)",
          border: `2px solid ${
            flash ? "rgba(255, 0, 0, 0.8)" : "rgba(0, 255, 0, 0.3)"
          }`,
          borderRadius: "12px",
          boxShadow: flash
            ? "0 0 30px rgba(255, 0, 0, 0.15), inset 0 0 30px rgba(255, 0, 0, 0.05)"
            : "0 0 20px rgba(0, 255, 0, 0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "border-color 0.15s ease, box-shadow 0.15s ease, width 0.05s linear, height 0.05s linear",
          backdropFilter: "blur(10px)",
          animation:
            "float 3.5s ease-in-out infinite 0.5s, pulse 3s ease-in-out infinite 0.5s",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "65%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <iframe
            src="https://gifer.com/embed/MXfo"
            width="100%"
            height="100%"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              border: "none",
              borderRadius: "12px 12px 0 0",
            }}
            allowFullScreen
          />
        </div>
        <div
          style={{
            color: flash ? "#ff0000" : "#00ff00",
            fontSize: Math.min(size3 / 6, 40),
            fontWeight: "300",
            fontFamily: "monospace",
            textShadow: flash
              ? "0 0 30px rgba(255, 0, 0, 0.2)"
              : "0 0 20px rgba(0, 255, 0, 0.1)",
            animation: "blinkRed 0.3s infinite",
            padding: "8px 0",
            letterSpacing: "4px",
            width: "100%",
            textAlign: "center",
            background: "rgba(0, 0, 0, 0.6)",
            transition: "color 0.15s ease, font-size 0.05s linear",
          }}
        >
          300 ;)
        </div>
      </div>
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PaymentNotification />
    <App />
  </StrictMode>
);
