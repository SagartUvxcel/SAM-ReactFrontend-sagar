import React, { useState } from "react";

const ScrollButton = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    if (scrolled > 300) {
      setVisible(true);
    } else if (scrolled <= 300) {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  window.addEventListener("scroll", toggleVisible);

  return (
    <span className="scroll-top">
      <i
        onClick={scrollToTop}
        style={{ display: visible ? "" : "none" }}
        className="bi bi-arrow-up-short"
      ></i>
    </span>
  );
};

export default ScrollButton;
