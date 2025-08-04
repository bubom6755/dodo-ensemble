import { useState } from "react";
import AnimatedCard from "./AnimatedCard";
import AnimatedButton from "./AnimatedButton";

const DailyQuestion = ({
  question,
  onAnswer,
  userAnswer,
  otherUserAnswer,
  userName,
  otherUserName,
  loading = false,
}) => {
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  const handleAnswer = async (answer) => {
    if (answer === null) {
      setShowReason(true);
    } else {
      await onAnswer(answer);
    }
  };

  const handleSubmitReason = async () => {
    if (reason.trim()) {
      await onAnswer(null, reason);
      setShowReason(false);
      setReason("");
    }
  };

  const getAnswerStatus = () => {
    if (userAnswer !== null) {
      return userAnswer === true ? "success" : "warning";
    }
    return "info";
  };

  const getAnswerText = () => {
    if (userAnswer === true) return "Oui";
    if (userAnswer === false) return "Non";
    if (userAnswer === null && reason) return "Avec raison";
    return "Non répondu";
  };

  return (
    <AnimatedCard delay={0}>
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#333",
            margin: "0 0 16px 0",
            lineHeight: "1.3",
          }}
        >
          Question du Jour
        </h2>
        <p
          style={{
            fontSize: "18px",
            color: "#666",
            margin: "0 0 24px 0",
            lineHeight: "1.5",
            fontStyle: "italic",
          }}
        >
          "{question}"
        </p>
      </div>

      {userAnswer === null ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <AnimatedButton
            onClick={() => handleAnswer(true)}
            variant="success"
            size="large"
            icon="✅"
            fullWidth
            loading={loading}
          >
            Oui
          </AnimatedButton>

          <AnimatedButton
            onClick={() => handleAnswer(false)}
            variant="danger"
            size="large"
            icon="❌"
            fullWidth
            loading={loading}
          >
            Non
          </AnimatedButton>

          <AnimatedButton
            onClick={() => handleAnswer(null)}
            variant="warning"
            size="large"
            icon="🤔"
            fullWidth
            loading={loading}
          >
            Avec raison
          </AnimatedButton>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255, 200, 220, 0.1)",
            borderRadius: "16px",
            padding: "20px",
            margin: "16px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "14px",
                  color: "#666",
                  fontWeight: 500,
                }}
              >
                Votre réponse :
              </span>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color:
                    getAnswerStatus() === "success"
                      ? "#4CAF50"
                      : getAnswerStatus() === "warning"
                      ? "#ff9800"
                      : "#666",
                }}
              >
                {getAnswerText()}
              </div>
              {reason && (
                <div
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginTop: "8px",
                    fontStyle: "italic",
                  }}
                >
                  "{reason}"
                </div>
              )}
            </div>
            <span style={{ fontSize: "24px" }}>
              {getAnswerStatus() === "success"
                ? "✅"
                : getAnswerStatus() === "warning"
                ? "🤔"
                : "❓"}
            </span>
          </div>

          {otherUserAnswer !== null && (
            <div
              style={{
                borderTop: "1px solid rgba(255, 200, 220, 0.3)",
                paddingTop: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "#666",
                  fontWeight: 500,
                }}
              >
                Réponse de {otherUserName} :
              </span>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color:
                    otherUserAnswer === true
                      ? "#4CAF50"
                      : otherUserAnswer === false
                      ? "#f44336"
                      : "#ff9800",
                }}
              >
                {otherUserAnswer === true
                  ? "Oui"
                  : otherUserAnswer === false
                  ? "Non"
                  : "Avec raison"}
              </div>
            </div>
          )}
        </div>
      )}

      {showReason && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "rgba(255, 200, 220, 0.1)",
            borderRadius: "16px",
            border: "2px solid rgba(255, 200, 220, 0.3)",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              margin: "0 0 12px 0",
              color: "#333",
            }}
          >
            Expliquez votre raison
          </h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Décrivez votre raison..."
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "12px",
              borderRadius: "12px",
              border: "2px solid rgba(255, 200, 220, 0.3)",
              fontSize: "16px",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#ff80ab";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255, 200, 220, 0.3)";
            }}
          />
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <AnimatedButton
              onClick={handleSubmitReason}
              variant="primary"
              size="medium"
              disabled={!reason.trim()}
            >
              Envoyer
            </AnimatedButton>
            <AnimatedButton
              onClick={() => setShowReason(false)}
              variant="secondary"
              size="medium"
            >
              Annuler
            </AnimatedButton>
          </div>
        </div>
      )}
    </AnimatedCard>
  );
};

export default DailyQuestion;
