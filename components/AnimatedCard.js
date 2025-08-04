import { useState } from "react";

const AnimatedCard = ({
  children,
  onClick,
  style = {},
  hoverEffect = true,
  clickEffect = true,
  delay = 0,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const baseStyle = {
    background: "#ffffff",
    borderRadius: 20,
    boxShadow: "0 6px 24px rgba(255, 200, 220, 0.4)",
    padding: 24,
    margin: "24px 0",
    width: "100%",
    maxWidth: 480,
    marginLeft: "auto",
    marginRight: "auto",
    boxSizing: "border-box",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: onClick ? "pointer" : "default",
    transform: `translateY(${delay * 20}px)`,
    opacity: 0,
    animation: `slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${
      delay * 0.1
    }s forwards`,
    ...style,
  };

  const hoverStyle = hoverEffect
    ? {
        transform: `translateY(${delay * 20 - 4}px) scale(1.02)`,
        boxShadow: "0 10px 30px rgba(255, 200, 220, 0.6)",
      }
    : {};

  const pressedStyle =
    clickEffect && isPressed
      ? {
          transform: `translateY(${delay * 20 - 2}px) scale(0.98)`,
          boxShadow: "0 4px 16px rgba(255, 200, 220, 0.5)",
        }
      : {};

  const combinedStyle = {
    ...baseStyle,
    ...(isHovered && hoverStyle),
    ...pressedStyle,
  };

  const handleMouseEnter = () => {
    if (hoverEffect) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverEffect) setIsHovered(false);
  };

  const handleMouseDown = () => {
    if (clickEffect) setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (clickEffect) setIsPressed(false);
  };

  const handleClick = (e) => {
    if (onClick) {
      // Add ripple effect
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 64, 129, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        width: 20px;
        height: 20px;
        left: ${e.clientX - e.currentTarget.offsetLeft}px;
        top: ${e.clientY - e.currentTarget.offsetTop}px;
      `;

      e.currentTarget.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);

      onClick(e);
    }
  };

  return (
    <>
      <div
        style={combinedStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedCard;
