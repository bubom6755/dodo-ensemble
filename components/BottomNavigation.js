import { useRouter } from "next/router";

const BottomNavigation = ({ activePage }) => {
  const router = useRouter();

  const navItems = [
    {
      id: "home",
      label: "Accueil",
      icon: "🏠",
      path: "/",
    },
    {
      id: "agenda",
      label: "Agenda",
      icon: "📅",
      path: "/agenda",
    },
    {
      id: "planning",
      label: "Planning",
      icon: "📋",
      path: "/planning",
    },
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255, 200, 220, 0.3)",
        zIndex: 1000,
        padding: "8px 0",
        boxShadow: "0 -2px 20px rgba(255, 200, 220, 0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          maxWidth: 420,
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              padding: "8px 12px",
              borderRadius: 12,
              cursor: "pointer",
              transition: "all 0.2s ease",
              minWidth: 60,
              opacity: activePage === item.id ? 1 : 0.7,
              transform: activePage === item.id ? "scale(1.05)" : "scale(1)",
              ...(activePage === item.id && {
                background: "rgba(255, 200, 220, 0.2)",
                boxShadow: "0 2px 8px rgba(255, 200, 220, 0.3)",
              }),
            }}
            onMouseEnter={(e) => {
              if (activePage !== item.id) {
                e.currentTarget.style.opacity = 0.9;
                e.currentTarget.style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              if (activePage !== item.id) {
                e.currentTarget.style.opacity = 0.7;
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            <span
              style={{
                fontSize: 24,
                marginBottom: 4,
                filter: activePage === item.id ? "none" : "grayscale(0.3)",
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: activePage === item.id ? 600 : 500,
                color: activePage === item.id ? "#d0488f" : "#888",
                textAlign: "center",
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
