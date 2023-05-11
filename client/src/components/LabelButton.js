import clsx from "clsx";
import React from "react";

function LabelButton(props) {
  const { text, className, ...rest } = props;

  return (
    <button
      className={clsx(
        "bg-transparent text-[18px] underline font-medium text-[#C4FFF9]",
        className
      )}
      {...rest}
    >
      {text}
    </button>
  );
}

export default LabelButton;
