import { useEffect, useState } from "react";
import AnimatedButton from "./AnimatedButton";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium", // small, medium, large, fullscreen
  showCloseButton = true,
  closeOnOverlayClick = true,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
        document.body.style.overflow = "unset";
      }, 300);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const getSizeStyles = () => {
    const sizes = {
      small: {
        maxWidth: "400px",
        width: "90vw",
        maxHeight: "80vh",
      },
      medium: {
        maxWidth: "600px",
        width: "90vw",
        maxHeight: "80vh",
      },
      large: {
        maxWidth: "800px",
        width: "90vw",
        maxHeight: "80vh",
      },
      fullscreen: {
        maxWidth: "100vw",
        width: "100vw",
        maxHeight: "100vh",
        height: "100vh",
        borderRadius: 0,
      },
    };
    return sizes[size] || sizes.medium;
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isVisible]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isOpen ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        backdropFilter: isOpen ? "blur(4px)" : "blur(0px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: size === "fullscreen" ? 0 : "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
          transform: isOpen
            ? "scale(1) translateY(0)"
            : "scale(0.9) translateY(20px)",
          opacity: isOpen ? 1 : 0,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          ...getSizeStyles(),
          ...props.style,
        }}
        {...props}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              padding: "24px 24px 0 24px",
              borderBottom: "1px solid rgba(255, 200, 220, 0.2)",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#333",
                  margin: 0,
                }}
              >
                {title}
              </h2>

              {showCloseButton && (
                <AnimatedButton
                  onClick={onClose}
                  variant="secondary"
                  size="small"
                  icon="✕"
                  style={{
                    minWidth: "40px",
                    height: "40px",
                    padding: 0,
                    borderRadius: "50%",
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div
          style={{
            padding: title ? "0 24px 24px 24px" : "24px",
            maxHeight: "calc(80vh - 120px)",
            overflowY: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// Specialized modal components
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation",
  message = "Êtes-vous sûr ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: "16px",
            color: "#666",
            margin: "0 0 24px 0",
            lineHeight: "1.5",
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <AnimatedButton onClick={onClose} variant="secondary" size="medium">
            {cancelText}
          </AnimatedButton>

          <AnimatedButton
            onClick={() => {
              onConfirm();
              onClose();
            }}
            variant={variant}
            size="medium"
          >
            {confirmText}
          </AnimatedButton>
        </div>
      </div>
    </Modal>
  );
};

const LoadingModal = ({
  isOpen,
  title = "Chargement...",
  message = "Veuillez patienter",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={title} size="small">
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid rgba(255, 200, 220, 0.3)",
            borderTop: "4px solid #ff4081",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px auto",
          }}
        />

        <p
          style={{
            fontSize: "16px",
            color: "#666",
            margin: 0,
          }}
        >
          {message}
        </p>

        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </Modal>
  );
};

export { Modal, ConfirmModal, LoadingModal };
export default Modal;
