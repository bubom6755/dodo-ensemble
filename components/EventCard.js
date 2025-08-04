import { useState } from "react";
import AnimatedCard from "./AnimatedCard";
import AnimatedButton from "./AnimatedButton";

const EventCard = ({
  event,
  onOpenModal,
  onRespond,
  userResponse,
  otherUserResponse,
  userName,
  otherUserName,
  isUpcoming = false,
  delay = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.substring(0, 5);
  };

  const getTimeUntilEvent = () => {
    const now = new Date();
    const eventDate = new Date(event.date + "T" + (event.time || "00:00"));
    const diff = eventDate - now;

    if (diff < 0) return "Événement passé";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `Dans ${days} jour${days > 1 ? "s" : ""}`;
    if (hours > 0) return `Dans ${hours} heure${hours > 1 ? "s" : ""}`;
    if (minutes > 0) return `Dans ${minutes} minute${minutes > 1 ? "s" : ""}`;
    return "Bientôt !";
  };

  const getResponseStatus = () => {
    if (userResponse === true)
      return { text: "Oui", color: "#4CAF50", icon: "✅" };
    if (userResponse === false)
      return { text: "Non", color: "#f44336", icon: "❌" };
    if (userResponse === null)
      return { text: "Avec raison", color: "#ff9800", icon: "🤔" };
    return { text: "Non répondu", color: "#666", icon: "❓" };
  };

  const getOtherResponseStatus = () => {
    if (otherUserResponse === true)
      return { text: "Oui", color: "#4CAF50", icon: "✅" };
    if (otherUserResponse === false)
      return { text: "Non", color: "#f44336", icon: "❌" };
    if (otherUserResponse === null)
      return { text: "Avec raison", color: "#ff9800", icon: "🤔" };
    return { text: "Non répondu", color: "#666", icon: "❓" };
  };

  return (
    <AnimatedCard
      delay={delay}
      onClick={() => onOpenModal(event)}
      style={{
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Mystery overlay for mystery events */}
      {event.is_mystery && !isUpcoming && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(255, 64, 129, 0.9) 0%, rgba(255, 128, 171, 0.9) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "20px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "#fff",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎁</div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 700,
                margin: "0 0 8px 0",
              }}
            >
              Événement Mystère
            </h3>
            <p
              style={{
                fontSize: "16px",
                margin: 0,
                opacity: 0.9,
              }}
            >
              Cliquez pour révéler !
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#333",
              margin: "0 0 8px 0",
              lineHeight: "1.3",
            }}
          >
            {event.title}
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            <span>📅</span>
            <span>{formatDate(event.date)}</span>
            {event.time && (
              <>
                <span>🕐</span>
                <span>{formatTime(event.time)}</span>
              </>
            )}
          </div>

          {event.location && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          )}

          {isUpcoming && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "#ff4081",
                fontWeight: 600,
              }}
            >
              <span>⏰</span>
              <span>{getTimeUntilEvent()}</span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
          }}
        >
          {userResponse !== undefined && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: getResponseStatus().color,
                fontWeight: 600,
              }}
            >
              <span>{getResponseStatus().icon}</span>
              <span>{getResponseStatus().text}</span>
            </div>
          )}
        </div>
      </div>

      {event.description && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            background: "rgba(255, 200, 220, 0.1)",
            borderRadius: "12px",
            fontSize: "14px",
            color: "#666",
            lineHeight: "1.5",
          }}
        >
          {event.description}
        </div>
      )}

      {/* Responses section */}
      {(userResponse !== undefined || otherUserResponse !== undefined) && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            background: "rgba(255, 200, 220, 0.05)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 200, 220, 0.2)",
          }}
        >
          <h4
            style={{
              fontSize: "16px",
              fontWeight: 600,
              margin: "0 0 12px 0",
              color: "#333",
            }}
          >
            Réponses
          </h4>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "14px", color: "#666" }}>
                {userName} :
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "14px",
                  color: getResponseStatus().color,
                  fontWeight: 600,
                }}
              >
                <span>{getResponseStatus().icon}</span>
                <span>{getResponseStatus().text}</span>
              </div>
            </div>

            {otherUserResponse !== undefined && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "14px", color: "#666" }}>
                  {otherUserName} :
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "14px",
                    color: getOtherResponseStatus().color,
                    fontWeight: 600,
                  }}
                >
                  <span>{getOtherResponseStatus().icon}</span>
                  <span>{getOtherResponseStatus().text}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {onRespond && userResponse === undefined && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          <AnimatedButton
            onClick={(e) => {
              e.stopPropagation();
              onRespond(event.id, true);
            }}
            variant="success"
            size="small"
            icon="✅"
          >
            Oui
          </AnimatedButton>

          <AnimatedButton
            onClick={(e) => {
              e.stopPropagation();
              onRespond(event.id, false);
            }}
            variant="danger"
            size="small"
            icon="❌"
          >
            Non
          </AnimatedButton>

          <AnimatedButton
            onClick={(e) => {
              e.stopPropagation();
              onRespond(event.id, null);
            }}
            variant="warning"
            size="small"
            icon="🤔"
          >
            Raison
          </AnimatedButton>
        </div>
      )}
    </AnimatedCard>
  );
};

export default EventCard;
