import { useEffect, useState } from "react";
import Lottie from "lottie-react";

const Loader = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/Love_is_blind.json")
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffeef8",
        zIndex: 9999,
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{ width: 180, height: 180 }}
        />
      ) : (
        <div
          style={{
            width: 60,
            height: 60,
            border: "6px solid #fff",
            borderTop: "6px solid #d0488f",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
};

export default Loader;
