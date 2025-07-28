import { useRouter } from "next/router";
import { useState } from "react";

const BottomNavigation = ({ activePage }) => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const navItems = [
    { id: "home", label: "Accueil", icon: "🏠", path: "/" },
    { id: "agenda", label: "Agenda", icon: "📅", path: "/agenda" },
    { id: "planning", label: "Planning", icon: "📋", path: "/planning" },
  ];

  const menuItems = [
    { id: "story", label: "Notre Histoire", icon: "📖", path: "/story" },
    { id: "secrets", label: "Boîtes à Secrets", icon: "🎁", path: "/secrets" },
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
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

          {/* Menu Hamburger */}
          <button
            onClick={toggleMenu}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: showMenu ? "rgba(255, 200, 220, 0.2)" : "none",
              border: "none",
              padding: "8px 12px",
              borderRadius: 12,
              cursor: "pointer",
              transition: "all 0.2s ease",
              minWidth: 60,
              opacity: showMenu ? 1 : 0.7,
              transform: showMenu ? "scale(1.05)" : "scale(1)",
              ...(showMenu && {
                boxShadow: "0 2px 8px rgba(255, 200, 220, 0.3)",
              }),
            }}
            onMouseEnter={(e) => {
              if (!showMenu) {
                e.currentTarget.style.opacity = 0.9;
                e.currentTarget.style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              if (!showMenu) {
                e.currentTarget.style.opacity = 0.7;
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            <span
              style={{
                fontSize: 24,
                marginBottom: 4,
                filter: showMenu ? "none" : "grayscale(0.3)",
              }}
            >
              {showMenu ? "✕" : "☰"}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: showMenu ? 600 : 500,
                color: showMenu ? "#d0488f" : "#888",
                textAlign: "center",
              }}
            >
              Menu
            </span>
          </button>
        </div>
      </div>

      {/* Menu déroulant */}
      {showMenu && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 16,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(15px)",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(255, 200, 220, 0.4)",
            border: "1px solid rgba(255, 200, 220, 0.3)",
            zIndex: 999,
            padding: "12px 0",
            minWidth: 180,
            animation: "slideInUp 0.3s ease-out",
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleNavigation(item.path);
                setShowMenu(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "none",
                border: "none",
                padding: "12px 16px",
                width: "100%",
                cursor: "pointer",
                transition: "background 0.2s ease",
                color: "#d0488f",
                fontSize: 16,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 200, 220, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Overlay pour fermer le menu */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
          }}
        />
      )}

      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default BottomNavigation;
