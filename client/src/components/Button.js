import React from "react";
import clsx from "clsx";
import { render } from "react-dom";

import { Spinner } from "react-activity";
import "react-activity/dist/library.css";

function Button(props) {
  const { text, img, imgClassName, className, onClick, loading, ...rest } =
    props;
  return (
    <button
      className={clsx(
        "w-full rounded-lg bg-[#07BEB8] py-[18px] text-center text-[#0C111F] text-[22px] font-medium",
        className
      )}
      {...rest}
      onClick={onClick}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Spinner />
        </div>
      ) : img ? (
        <img
          src={img}
          className={clsx("h-[20px] w-[20px] m-auto", imgClassName)}
        />
      ) : (
        text
      )}
    </button>
  );
}

export default Button;
