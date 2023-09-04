import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectSetPasswordPage = ({ children }) => {
  let verifiedToken = localStorage.getItem("token");
  const goTo = useNavigate();
  const ProtectAllPages = () => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
      goTo("/access-denied");
    } else if (!verifiedToken) {
      goTo("/access-denied");
    }
  };
  useEffect(() => {
    ProtectAllPages();
  });

  return children;
};

export default ProtectSetPasswordPage;
