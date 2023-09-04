import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Only loggedIn user will have access to the components wrapped in this component.
const ProtectedForLoggedInUser = ({ children }) => {
  const goTo = useNavigate();
  const checkStatusOfLogin = async () => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (!data) {
      goTo("/access-denied");
    }
  };
  useEffect(() => {
    checkStatusOfLogin();
  });

  return children;
};

export default ProtectedForLoggedInUser;
