import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkLoginSession } from "../CommonFunctions";

const ProtectedPages = ({ children }) => {
  const goTo = useNavigate();
  const ProtectAllPages = async () => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
      checkLoginSession(data.loginToken).then((res) => {
        if (res === "Valid") {
          goTo("/access-denied");
        }
      });
    }
  };
  useEffect(() => {
    ProtectAllPages();
  });

  return children;
};

export default ProtectedPages;
