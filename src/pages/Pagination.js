import React from "react";

const Pagination = ({ currentPage, totalPages, onNextPage, onPrevPage, onPageChange }) => {
  const numbers = [...Array(totalPages).keys()].map((n) => n + 1);

  return (
    <nav>
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <a
            href="#"
            className="page-link"
            onClick={() => onPrevPage()}
          >
            Precedent 
          </a>
        </li>
        {numbers.map((n) => (
          <li
            key={n}
            className={`page-item ${currentPage === n ? "active" : ""}`}
          >
            <a
              href="#"
              className="page-link"
              onClick={() => onPageChange(n)}
            >
              {n}
            </a>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <a
            href="#"
            className="page-link"
            onClick={() => onNextPage()}
          >
            Suivant
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
