import React from "react";
import Footers from "./Footer";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footers />
    </>
  );
};

export default Layout;
