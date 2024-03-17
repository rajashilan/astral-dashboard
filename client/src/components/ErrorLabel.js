import React from "react";
import clsx from "clsx";

function ErrorLabel(props) {
  const { text, className, children } = props;
  return (
    <p
      className={clsx(
        "relative top-1 left-1 !mt-[4px] text-[16px] text-[#e36872] !text-left",
        className
      )}
    >
      {children}
    </p>
  );
}

export default ErrorLabel;
