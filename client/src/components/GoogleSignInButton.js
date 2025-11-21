import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

const scriptId = "google-identity-script";

export default function GoogleSignInButton({ onCredential, text = "signin_with" }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const buttonNode = buttonRef.current;

    const initialize = () => {
      if (!window.google || !process.env.REACT_APP_GOOGLE_CLIENT_ID) return;

      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential && typeof onCredential === "function") {
            onCredential(response.credential);
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_blue",
        size: "large",
        text,
        width: "100%",
      });
    };

    if (document.getElementById(scriptId)) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = scriptId;
    script.onload = initialize;
    document.body.appendChild(script);

    return () => {
      if (buttonNode) {
        buttonNode.innerHTML = "";
      }
    };
  }, [onCredential, text]);

  return <Box ref={buttonRef} sx={{ width: "100%", minHeight: 48 }} />;
}

