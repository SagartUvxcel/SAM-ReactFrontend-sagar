import React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import propertyData from "./data.json";

const ViewEditProperty = () => {
  const { id } = useParams();
  useEffect(() => {
    console.log(id);
  }, []);

  return (
    <section className="mt-5 admin-edit-property wrapper">
      <div className="container-fluid">View & Edit</div>
    </section>
  );
};

export default ViewEditProperty;
