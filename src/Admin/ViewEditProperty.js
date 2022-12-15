import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/1.CommonLayout/Layout";
import propertyData from "./data.json";

const ViewEditProperty = () => {
  const { id } = useParams();
  const [property, setProperty] = useState([]);

  const setCurrentProperty = () => {
    for (let i of propertyData) {
      if (i.id === id) {
        setProperty(i);
      }
    }
  };

  useEffect(() => {
    setCurrentProperty();
  });

  return (
    <Layout>
      <section className="mt-5 admin-edit-property wrapper min-100vh">
        <div className="container-fluid">
          View & Edit - {property.city_name}
        </div>
      </section>
    </Layout>
  );
};

export default ViewEditProperty;
