import { useState } from "react";

const AnimatedButton = ({
  children,
  onClick,
  variant = "primary", // primary, secondary, success, danger, warning
  size = "medium", // small, medium, large
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style = {},
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantStyles = () => {
    const variants = {
      primary: {
        background: "linear-gradient(135deg, #ff80ab 0%, #ff4081 100%)",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(255, 64, 129, 0.4)",
        border: "none",
      },
      secondary: {
        background: "#fff",
        color: "#ff4081",
        boxShadow: "0 4px 12px rgba(255, 64, 129, 0.2)",
        border: "2px solid #ff80ab",
      },
      success: {
        background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
        border: "none",
      },
      danger: {
        background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(244, 67, 54, 0.4)",
        border: "none",
      },
      warning: {
        background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(255, 152, 0, 0.4)",
        border: "none",
      },
    };
    return variants[variant] || variants.primary;
  };

  const getSizeStyles = () => {
    const sizes = {
      small: {
        padding: "8px 16px",
        fontSize: "14px",
        borderRadius: "20px",
      },
      medium: {
        padding: "12px 24px",
        fontSize: "16px",
        borderRadius: "24px",
      },
      large: {
        padding: "16px 32px",
        fontSize: "18px",
        borderRadius: "28px",
      },
    };
    return sizes[size] || sizes.medium;
  };

  const baseStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 600,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    position: "relative",
    overflow: "hidden",
    width: fullWidth ? "100%" : "auto",
    opacity: disabled ? 0.6 : 1,
    transform: isPressed ? "scale(0.98)" : "scale(1)",
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  const hoverStyle =
    !disabled && !loading
      ? {
          transform: "translateY(-2px) scale(1.02)",
          boxShadow:
            variant === "secondary"
              ? "0 6px 20px rgba(255, 64, 129, 0.3)"
              : "0 8px 20px rgba(255, 64, 129, 0.6)",
        }
      : {};

  const handleMouseDown = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    if (!disabled && !loading) {
      setIsPressed(false);
    }
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      // Add ripple effect
      const ripple = document.createElement("div");
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: buttonRipple 0.6s linear;
        pointer-events: none;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
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
      <button
        style={{
          ...baseStyle,
          ...hoverStyle,
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderTop: "2px solid #fff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            Chargement...
          </>
        ) : (
          <>
            {icon && <span style={{ fontSize: "18px" }}>{icon}</span>}
            {children}
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes buttonRipple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedButton;
