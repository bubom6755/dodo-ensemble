import { useState, useEffect } from "react";
import AnimatedCard from "./AnimatedCard";

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "#ff4081",
  delay = 0,
  animate = true,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setIsVisible(true), delay * 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animate, delay]);

  useEffect(() => {
    if (isVisible && animate) {
      const startValue = 0;
      const endValue = value;
      const duration = 1000;
      const startTime = Date.now();

      const animateValue = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(
          startValue + (endValue - startValue) * easeOutQuart
        );

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animateValue);
        }
      };

      requestAnimationFrame(animateValue);
    } else {
      setDisplayValue(value);
    }
  }, [isVisible, value, animate]);

  return (
    <AnimatedCard
      delay={delay}
      style={{
        textAlign: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          right: "-50%",
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: "32px",
            marginBottom: "12px",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "scale(1)" : "scale(0.5)",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {icon}
        </div>

        {/* Value */}
        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: color,
            marginBottom: "8px",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDelay: "0.2s",
          }}
        >
          {displayValue}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#333",
            margin: "0 0 4px 0",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDelay: "0.3s",
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              margin: 0,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: "0.4s",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </AnimatedCard>
  );
};

// Component for displaying multiple stats in a grid
const StatsGrid = ({ stats, columns = 2 }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "16px",
        margin: "24px 0",
      }}
    >
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
          delay={index}
        />
      ))}
    </div>
  );
};

// Component for progress bars
const ProgressBar = ({
  value,
  max = 100,
  label,
  color = "#ff4081",
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible) {
      const startValue = 0;
      const endValue = value;
      const duration = 1000;
      const startTime = Date.now();

      const animateValue = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(
          startValue + (endValue - startValue) * easeOutQuart
        );

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animateValue);
        }
      };

      requestAnimationFrame(animateValue);
    }
  }, [isVisible, value]);

  const percentage = (displayValue / max) * 100;

  return (
    <div
      style={{
        margin: "16px 0",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#333",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: color,
          }}
        >
          {displayValue}/{max}
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: "8px",
          background: "rgba(255, 200, 220, 0.3)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
            borderRadius: "4px",
            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
};

export { StatsCard, StatsGrid, ProgressBar };
export default StatsCard;
