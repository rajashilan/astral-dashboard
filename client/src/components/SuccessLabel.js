import React from "react";
import clsx from "clsx";

function SuccessLabel(props) {
  const { text, className, children } = props;
  return (
    <p
      className={clsx(
        "relative top-1 left-1 !mt-[4px] text-[16px] text-[#27CB6C] !text-left",
        className
      )}
    >
      {children}
    </p>
  );
}

export default SuccessLabel;
