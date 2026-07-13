import React from "react";

const PagePagination = ({
  page,
  totalPages,
  onChange,
  className,
  previousLabel = "Previous",
  nextLabel = "Next",
  asList = false,
}) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const renderButton = (label, targetPage, disabled, active = false) => (
    <button
      type="button"
      disabled={disabled}
      className={active ? "active" : ""}
      onClick={() => onChange(targetPage)}
    >
      {label}
    </button>
  );

  if (asList) {
    return (
      <nav className={className}>
        <ul>
          <li>{renderButton(previousLabel, page - 1, page <= 1)}</li>
          {pages.map((item) => (
            <li key={item} className={item === page ? "active" : ""}>
              {renderButton(item, item, false)}
            </li>
          ))}
          <li>{renderButton(nextLabel, page + 1, page >= totalPages)}</li>
        </ul>
      </nav>
    );
  }

  return (
    <div className={className}>
      {renderButton(previousLabel, page - 1, page <= 1)}
      {pages.map((item) => renderButton(item, item, false, item === page))}
      {renderButton(nextLabel, page + 1, page >= totalPages)}
    </div>
  );
};

export default PagePagination;
