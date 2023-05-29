import React, { useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";

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
      console.log(state.role);
      if (state.role === "sudo") return;
      else if (state.role === "general") return;
      else if (state.role.split(":")[0] === "focused") {
        navigate(state.role.split(":")[1]);
      } else if (state.role.split(":")[0] === "department") {
        console.log("department");
        navigate("/department", {
          state: {
            departmentID: state.role.split(":")[1],
          },
        });
      }
    }
  }, [loading]);

  let menu = loading ? (
    <p>loading...</p>
  ) : state.role === "sudo" ? (
    <div className="flex flex-col text-center space-y-[0.5rem]">
      <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
        college
      </p>
      <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
        orientation
      </p>
      <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
        clubs
      </p>
      <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
        departments
      </p>
      <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
        staff list
      </p>
    </div>
  ) : state.role === "general" ? (
    <div className="flex flex-col text-center space-y-[0.5rem]">
      <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
        orientation
      </p>
      <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
        clubs
      </p>
      <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
        departments
      </p>
      <p className="text-[46px] font-normal text-[#C4FFF9] cursor-pointer">
        staff list
      </p>
    </div>
  ) : null;

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
