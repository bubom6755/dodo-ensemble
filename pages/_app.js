import "../styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration);
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError);
          });
      });
    }

    // Handle PWA install prompt
    let deferredPrompt;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show install button or notification
      if (window.showToast) {
        window.showToast({
          message: "Installez Dodo Ensemble sur votre écran d'accueil ! 📱",
          type: "info",
          duration: 5000,
        });
      }
    });

    // Handle successful PWA install
    window.addEventListener("appinstalled", () => {
      console.log("PWA was installed");
      if (window.showToast) {
        window.showToast({
          message: "Dodo Ensemble installé avec succès ! 🎉",
          type: "success",
        });
      }
    });

    // Handle online/offline status
    const handleOnline = () => {
      if (window.showToast) {
        window.showToast({
          message: "Connexion rétablie ! 🌐",
          type: "success",
        });
      }
    };

    const handleOffline = () => {
      if (window.showToast) {
        window.showToast({
          message: "Vous êtes hors ligne 📴",
          type: "warning",
        });
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Page became visible - could trigger sync or notifications
        console.log("Page became visible");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Track page views or trigger animations
      console.log("Route changed to:", url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
