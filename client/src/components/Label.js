import React from "react";
import clsx from "clsx";

function Label(props) {
  const { text, className, children } = props;
  return (
    <p
      className={clsx(
        "relative top-1 left-1 !mt-[4px] text-[14px] text-[#A7AFC7] !text-left",
        className
      )}
    >
      {children}
    </p>
  );
}

export default Label;
