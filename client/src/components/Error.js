import React from "react";
import clsx from "clsx";
import { useSelector } from "react-redux";

function Error(props) {
  const error = useSelector((state) => state.UI.error);

  const { className } = props;
  return (
    <p
      className={clsx(
        "relative top-1 left-1 !mt-[4px] text-[16px] text-[#ff6600] !text-left",
        className
      )}
    >
      {error}
    </p>
  );
}

export default Error;
