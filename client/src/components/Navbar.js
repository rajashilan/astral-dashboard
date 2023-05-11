import React, { useState } from "react";
import logo from "../assets/logo.svg";

function Navbar() {
  const [authorized, setAuthorized] = useState(false);
  const navActive = "font-bold text-[#C4FFF9] underline text-[1.125rem]";
  const navInactive = "font-normal text-[#DFE5F8] text-[1.125rem]";
  const hiddenClass = authorized
    ? "sticky top-0 h-[5.75rem] flex flex-row w-full bg-[#0C111F] px-[5rem] justify-between items-center"
    : "hidden";

  return (
    <div className={hiddenClass}>
      <img src={logo} alt="astral" className="w-[7rem] h-[3.25rem]" />
      <div className="flex flex-row space-x-[2.875rem]">
        <a href="#" className={navActive}>
          college
        </a>
        <a href="#" className={navInactive}>
          orientation
        </a>
        <a href="#" className={navInactive}>
          clubs
        </a>
        <a href="#" className={navInactive}>
          departments
        </a>
        <a href="#" className={navInactive}>
          staff list
        </a>
        <div className="!ml-[4rem]">
          <a href="#" className={navInactive}>
            Darmian
          </a>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
