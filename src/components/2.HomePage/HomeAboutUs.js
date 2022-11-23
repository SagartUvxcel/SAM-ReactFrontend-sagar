import React from "react";
import WhoWeAre from "../../images/2.png";
import WhyChooseUs from "../../images/3.png";

const HomeAboutUs = () => {
  return (
    <>
      <section id="about" className="home-about-wrapper">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 about-details-col bg-white common-col order-md-1 order-1">
              <div className="px-md-4 px-lg-5 px-2 text-center">
                <h1 className="text-center">WHO WE ARE</h1>
                <p>
                  Finding the right property requires a lot of time and effort.
                  Won`t it be convenient if all the properties that fit your
                  needs were literally served to you on a platter? Well, explore
                  more properties here that will match your expectations
                  perfectly.
                </p>
              </div>
            </div>
            <div className="col-md-6 common-col order-md-2 order-2">
              <img src={WhoWeAre} alt="about-us-img" />
            </div>
            <div className="col-md-6 common-col order-md-3 order-4">
              <img src={WhyChooseUs} alt="why-choose-us" />
            </div>
            <div className="col-md-6 why-choose-us-col bg-white common-col order-md-4 order-3">
              <div className="px-md-3 px-lg-0 text-dark">
                <h1 className="text-center">WHY CHOOSE US ?</h1>
                <ul className="text-justify">
                  <li>We have a strong track record of succesful project</li>
                  <li>
                    We have a dedicated team with the expertise and skills
                  </li>
                  <li>We negotiate the best deals for our clients</li>
                  <li>We have a solid network of resources in the industry</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeAboutUs;
