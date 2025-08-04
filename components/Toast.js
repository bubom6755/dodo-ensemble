import { useState, useEffect } from "react";

const Toast = ({ message, type = "info", duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = {
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: isAnimating
        ? "translateX(-50%) translateY(-100px)"
        : "translateX(-50%) translateY(0)",
      zIndex: 9999,
      padding: "16px 24px",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: 500,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      maxWidth: "90vw",
      width: "max-content",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    };

    const typeStyles = {
      success: {
        background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
        color: "#fff",
        borderColor: "rgba(76, 175, 80, 0.3)",
      },
      error: {
        background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
        color: "#fff",
        borderColor: "rgba(244, 67, 54, 0.3)",
      },
      warning: {
        background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
        color: "#fff",
        borderColor: "rgba(255, 152, 0, 0.3)",
      },
      info: {
        background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
        color: "#fff",
        borderColor: "rgba(33, 150, 243, 0.3)",
      },
      pink: {
        background: "linear-gradient(135deg, #ff80ab 0%, #ff4081 100%)",
        color: "#fff",
        borderColor: "rgba(255, 128, 171, 0.3)",
      },
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const getIcon = () => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
      pink: "💖",
    };
    return icons[type] || icons.info;
  };

  if (!isVisible) return null;

  return (
    <div style={getToastStyles()}>
      <span style={{ fontSize: "20px" }}>{getIcon()}</span>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
