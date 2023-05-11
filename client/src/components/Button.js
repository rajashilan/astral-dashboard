import React from "react";
import clsx from "clsx";

function Button(props) {
  const { text, className, onClick, ...rest } = props;
  return (
    <button
      className={clsx(
        "w-full rounded-lg bg-[#07BEB8] py-[18px] text-center text-[#0C111F] text-[22px] font-medium",
        className
      )}
      {...rest}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default Button;
