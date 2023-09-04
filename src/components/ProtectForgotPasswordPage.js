import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectForgotPasswordPage = ({children}) => {
  let verifiedUser = localStorage.getItem("forgotPassUserName");
  const goTo = useNavigate();
  const ProtectAllPages = () => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
      goTo("/access-denied");
    } else if (!verifiedUser) {
      goTo("/access-denied");
    }
  };
  useEffect(() => {
    ProtectAllPages();
  });

  return children;
};

export default ProtectForgotPasswordPage;
