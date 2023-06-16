import React from "react";
import clsx from "clsx";
import ErrorLabel from "./ErrorLabel";

function TextInput(props) {
  const {
    type,
    className,
    id,
    errors,
    register,
    value,
    textarea,
    onChange,
    ...rest
  } = props;

  let input = textarea ? (
    <textarea
      rows={10}
      type={type}
      className={clsx(
        "bg-[#1A2238] px-[16px] py-[18px] w-full rounded-lg outline-[#232F52] placeholder-[#A7AFC7] text-[#DFE5F8] text-[16px]",
        className,
        errors && errors[id] && "input-error"
      )}
      id={id}
      value={value}
      onChange={onChange}
      {...rest}
      {...(register && register(id))}
    />
  ) : (
    <input
      type={type}
      className={clsx(
        "bg-[#1A2238] px-[16px] py-[18px] w-full rounded-lg outline-[#232F52] placeholder-[#A7AFC7] text-[#DFE5F8] text-[16px]",
        className,
        errors && errors[id] && "input-error"
      )}
      id={id}
      value={value}
      onChange={onChange}
      {...rest}
      {...(register && register(id))}
    />
  );

  return (
    <>
      {input}
      {errors && errors[id] && <ErrorLabel>{errors[id].message}</ErrorLabel>}
    </>
  );
}

export default TextInput;
