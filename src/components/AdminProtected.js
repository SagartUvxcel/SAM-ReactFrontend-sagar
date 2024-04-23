import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Only loggedIn user will have access to the components wrapped in this component.
const AdminProtected = ({ children }) => {
  const goTo = useNavigate();
  const checkIsAdmin = async () => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
      if (data.roleId === 1 || data.isBank) {
      } else {
        goTo("/access-denied"); 
      }
    } else {
      goTo("/access-denied");
    }
  };
  useEffect(() => {
    checkIsAdmin();
  });

  return children;
};

export default AdminProtected;
