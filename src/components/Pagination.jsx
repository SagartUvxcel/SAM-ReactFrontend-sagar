import React from "react";
import ReactPaginate from "react-paginate";

const Pagination = ({ pageCount, handlePageClick }) => {
  return (
    <ReactPaginate
      containerClassName={"pagination d-flex justify-content-center"}
      pageCount={pageCount}
      pageClassName={"page-item"}
      pageLinkClassName={"page-link px-md-3"}
      previousLabel={"Prev"}
      previousClassName={"page-item"}
      previousLinkClassName={"page-link"}
      breakLabel={"..."}
      breakClassName={"page-item"}
      breakLinkClassName={"page-link"}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      nextLabel={"Next"}
      nextClassName={"page-item"}
      nextLinkClassName={"page-link"}
      onPageChange={handlePageClick}
      activeClassName={"active"}
    />
  );
};

export default Pagination;
