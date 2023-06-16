import React from "react";
import clsx from "clsx";

function Button(props) {
  const { text, img, className, onClick, ...rest } = props;
  return (
    <button
      className={clsx(
        "w-full rounded-lg bg-[#07BEB8] py-[18px] text-center text-[#0C111F] text-[22px] font-medium",
        className
      )}
      {...rest}
      onClick={onClick}
    >
      {img ? <img src={img} className="h-[20px] w-[20px] m-auto" /> : text}
    </button>
  );
}

export default Button;
