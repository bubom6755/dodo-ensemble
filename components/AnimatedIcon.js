import { useState, useEffect } from "react";

const AnimatedIcon = ({
  icon,
  size = "medium", // small, medium, large, xlarge
  color = "#ff4081",
  animation = "none", // none, pulse, bounce, spin, wiggle, heart
  delay = 0,
  onClick,
  style = {},
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  const getSizeStyles = () => {
    const sizes = {
      small: { fontSize: "16px" },
      medium: { fontSize: "24px" },
      large: { fontSize: "32px" },
      xlarge: { fontSize: "48px" },
    };
    return sizes[size] || sizes.medium;
  };

  const getAnimationStyles = () => {
    const animations = {
      none: {},
      pulse: {
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      bounce: {
        animation: "bounce 1s infinite",
      },
      spin: {
        animation: "spin 1s linear infinite",
      },
      wiggle: {
        animation: "wiggle 0.5s ease-in-out infinite",
      },
      heart: {
        animation: "heartBeat 1.5s ease-in-out infinite",
      },
    };
    return animations[animation] || animations.none;
  };

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: onClick ? "pointer" : "default",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "scale(1)" : "scale(0.5)",
    color: color,
    ...getSizeStyles(),
    ...getAnimationStyles(),
    ...style,
  };

  const hoverStyle = isHovered
    ? {
        transform: "scale(1.1)",
        filter: "brightness(1.1)",
      }
    : {};

  const combinedStyle = {
    ...baseStyle,
    ...hoverStyle,
  };

  return (
    <>
      <span
        style={combinedStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        {...props}
      >
        {icon}
      </span>

      <style jsx>{`
        @keyframes wiggle {
          0%,
          7% {
            transform: rotateZ(0);
          }
          15% {
            transform: rotateZ(-15deg);
          }
          20% {
            transform: rotateZ(10deg);
          }
          25% {
            transform: rotateZ(-10deg);
          }
          30% {
            transform: rotateZ(6deg);
          }
          35% {
            transform: rotateZ(-4deg);
          }
          40%,
          100% {
            transform: rotateZ(0);
          }
        }

        @keyframes heartBeat {
          0% {
            transform: scale(1);
          }
          14% {
            transform: scale(1.3);
          }
          28% {
            transform: scale(1);
          }
          42% {
            transform: scale(1.3);
          }
          70% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

// Specialized icon components
const HeartIcon = ({ isLiked = false, onClick, ...props }) => {
  return (
    <AnimatedIcon
      icon={isLiked ? "❤️" : "🤍"}
      animation={isLiked ? "heart" : "none"}
      color={isLiked ? "#ff4081" : "#ccc"}
      onClick={onClick}
      {...props}
    />
  );
};

const StarIcon = ({ isFilled = false, onClick, ...props }) => {
  return (
    <AnimatedIcon
      icon={isFilled ? "⭐" : "☆"}
      animation={isFilled ? "pulse" : "none"}
      color={isFilled ? "#ffd700" : "#ccc"}
      onClick={onClick}
      {...props}
    />
  );
};

const NotificationIcon = ({ hasNotification = false, onClick, ...props }) => {
  return (
    <div style={{ position: "relative" }}>
      <AnimatedIcon
        icon="🔔"
        animation={hasNotification ? "bounce" : "none"}
        onClick={onClick}
        {...props}
      />
      {hasNotification && (
        <div
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            width: "12px",
            height: "12px",
            background: "#ff4081",
            borderRadius: "50%",
            border: "2px solid #fff",
            animation: "pulse 2s infinite",
          }}
        />
      )}
    </div>
  );
};

const LoadingIcon = ({ size = "medium", color = "#ff4081" }) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...getSizeStyles(size),
      }}
    >
      <div
        style={{
          width: "1em",
          height: "1em",
          border: `2px solid ${color}20`,
          borderTop: `2px solid ${color}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  );
};

const getSizeStyles = (size) => {
  const sizes = {
    small: { fontSize: "16px" },
    medium: { fontSize: "24px" },
    large: { fontSize: "32px" },
    xlarge: { fontSize: "48px" },
  };
  return sizes[size] || sizes.medium;
};

export { AnimatedIcon, HeartIcon, StarIcon, NotificationIcon, LoadingIcon };
export default AnimatedIcon;
