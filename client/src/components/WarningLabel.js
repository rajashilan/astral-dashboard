import React from "react";
import clsx from "clsx";

function WarningLabel(props) {
  const { text, className, children } = props;
  return (
    <p
      className={clsx(
        "relative top-1 left-1 !mt-[4px] text-[16px] text-[#ff6600] !text-left",
        className
      )}
    >
      {children}
    </p>
  );
}

export default WarningLabel;
