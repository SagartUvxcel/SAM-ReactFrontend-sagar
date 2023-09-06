import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";


// Only loggedIn user will have access to the components wrapped in this component.
const UserProtected = ({ children }) => {
  const goTo = useNavigate();
  const checkIsAdmin = async () => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
      if (data.roleId === 3 && data.isBank===false || data.roleId === "" ) {
      } else {
        goTo("/access-denied");
        
      }
    } else {
      <>
        {/* if user not Login */}
        <div className="container-fluid wrapper">
          <h1 className="text-center">You don't have access to this page</h1>
          <div className="text-muted text-center">Please login or register </div>

          <div className="mt-5 row justify-content-center">
            <NavLink to="/login" className="btn btn-outline-primary col-md-2"> Login </NavLink>
            <div className="col-2 text-center">
              <h5>OR</h5>
            </div>
            <NavLink to="/register" className="btn btn-outline-primary col-md-2"> Register </NavLink>

          </div>
        </div>
      </>
    }
  };
  useEffect(() => {
    checkIsAdmin();
  });

  return children;
};

export default UserProtected;
