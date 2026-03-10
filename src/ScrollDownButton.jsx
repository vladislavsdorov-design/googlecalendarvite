import React, { useState, useEffect, useRef } from "react";
import "./ScrollDownButton.css";

const ScrollDownButton = ({ targetRef, color = "black", size = 50 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Прячем кнопку когда доскроллили до низа
      if (scrollY + windowHeight >= documentHeight - 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", checkScroll);
    checkScroll(); // Проверяем при загрузке

    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const scrollToTarget = () => {
    if (targetRef && targetRef.current) {
      // Если передан ref, скроллим к нему
      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      // Если ref не передан, скроллим на 80% высоты окна
      window.scrollBy({
        top: window.innerHeight * 0.8,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={`scroll-down-button ${isVisible ? "visible" : "hidden"} ${
        isHovered ? "hovered" : ""
      }`}
      onClick={scrollToTarget}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        "--button-size": `${size}px`,
        "--button-color": color,
        "--button-hover-color": color === "black" ? "#333" : color,
      }}
    >
      <div className="circle">
        <div className="arrow-container">
          <i className="fa-solid fa-chevron-down"></i>
          <i className="fa-solid fa-chevron-down second-arrow"></i>
        </div>
      </div>
      <span className="scroll-text">Scroll</span>
    </div>
  );
};

export default ScrollDownButton;
