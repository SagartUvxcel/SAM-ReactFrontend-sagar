import { useEffect } from "react";
import { useLocation } from "react-router";

// Wrapped all components in this component in App.js file so that when we switch from one page to other then that page will scroll to top automatically.
const ScrollToTop = (props) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return <>{props.children}</>;
};

export default ScrollToTop;
