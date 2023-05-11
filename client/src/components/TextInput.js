import React from "react";
import clsx from "clsx";
import ErrorLabel from "./ErrorLabel";

function TextInput(props) {
  const { type, className, id, errors, register, value, ...rest } = props;

  return (
    <>
      <input
        type={type}
        className={clsx(
          "bg-[#1A2238] px-[16px] py-[18px] w-full rounded-lg outline-[#232F52] placeholder-[#A7AFC7] text-[#DFE5F8] text-[16px]",
          className,
          errors && errors[id] && "input-error"
        )}
        id={id}
        value={value}
        {...rest}
        {...(register && register(id))}
      />
      {errors && errors[id] && <ErrorLabel>{errors[id].message}</ErrorLabel>}
    </>
  );
}

export default TextInput;
