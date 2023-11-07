import React, { useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/actions/userActions";

// show menu based on user's role

//roles:
//sudo (all)
//general (everything else other than adding new admins)
//focused: (only what they are focused for: college, orientation, clubs, departments, staff list)
//department:departmentID (department, only for a particular department)
//for department, if page doesn't exist, show prompt to create a new department page

export default function Menu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((state) => state.user.adminData);
  const loading = useSelector((state) => state.UI.loading);

  //sudo and general show as usual
  //focused, straight away bring them to the particular page
  //department, straight away bring them to their particular department
  useEffect(() => {
    if (!loading) {
      if (state.role) {
        if (state.role[0] === "focused:studentgovernment") navigate("/clubs");
        else return;
      } else navigate("/login");
    }
  }, [state.role]);

  let menu = loading ? (
    <p>loading...</p>
  ) : state.role[0] === "sudo" ? (
    <div className="flex flex-col text-center space-y-[0.5rem]">
      <Link to="/college">
        <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
          college
        </p>
      </Link>
      <Link to="/orientation">
        <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
          orientation
        </p>
      </Link>
      <Link to="/clubs">
        <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
          clubs
        </p>
      </Link>
    </div>
  ) : (
    <div className="flex flex-col text-center space-y-[0.5rem]">
      {state.role.includes("focused:college") && (
        <Link to="/college">
          <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
            college
          </p>
        </Link>
      )}
      {state.role.includes("focused:orientation") && (
        <Link to="/orientation">
          <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
            orientation
          </p>
        </Link>
      )}
      {state.role.includes("focused:clubs") && (
        <Link to="/clubs">
          <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
            clubs
          </p>
        </Link>
      )}
    </div>
  );

  return (
    <main className="absolute top-0 flex h-screen w-full flex-col justify-center items-center bg-[#0C111F]">
      <img src={logo} alt="astral" className="h-[98px] w-[184px] mb-[48px]" />
      {menu}
      <button
        onClick={() => dispatch(logoutUser())}
        className="text-gray-400 text-[24px] mt-[24px] font-normal cursor-pointer text-center"
      >
        logout
      </button>
    </main>
  );
}
