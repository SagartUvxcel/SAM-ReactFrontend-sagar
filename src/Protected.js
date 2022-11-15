import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Protected = ({ children }) => {
  const goTo = useNavigate();
  const checkStatusOfLogin = () => {
    const statusOfLogin = localStorage.getItem("isLoggedIn");
    if (statusOfLogin === null) {
      goTo("/");
    }
  };
  useEffect(() => {
    checkStatusOfLogin();
  });

  return children;
};

export default Protected;
