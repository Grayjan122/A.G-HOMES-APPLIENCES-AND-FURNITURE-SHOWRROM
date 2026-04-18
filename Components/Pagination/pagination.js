"use client";
import { Pagination } from "react-bootstrap";

export default function CustomPagination({
  currentPage,
  totalPages,
  onPageChange,
  color = "green",
}) {
  return (
    <Pagination color={color}>
      <Pagination.First
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      />
      <Pagination.Prev
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(
          (page) =>
            Math.abs(page - currentPage) <= 2 ||
            page === 1 ||
            page === totalPages
        )
        .map((page, index, arr) => {
          const prevPage = arr[index - 1];
          if (index > 0 && page - prevPage > 1) {
            return <Pagination.Ellipsis key={`ellipsis-${page}`} disabled />;
          }
          return (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Pagination.Item>
          );
        })}

      <Pagination.Next
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
      <Pagination.Last
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );
}
