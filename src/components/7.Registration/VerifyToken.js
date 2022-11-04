import React, { useEffect } from "react";
import { useState } from "react";

const VerifyToken = ({ token }) => {
  const [savedToken, setSavedToken] = useState("");
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setSavedToken(token);
    } else {
      setSavedToken(localStorage.getItem("token"));
    }
  }, []);

  return (
    <button
      onClick={() => {
        console.log(savedToken);
      }}
    >
      VerifyToken
    </button>
  );
};

export default VerifyToken;
