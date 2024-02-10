import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/actions/userActions";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((state) => state.user.adminData);
  const loading = useSelector((state) => state.UI.loading);

  const [authorized, setAuthorized] = useState(false);
  const navActive = "font-bold text-[#C4FFF9] underline text-[1.125rem]";
  const navInactive = "font-normal text-[#DFE5F8] text-[1.125rem]";
  const hiddenClass = state.role
    ? "sticky top-0 h-[5.75rem] flex flex-row w-full bg-[#0C111F] px-[5rem] justify-between items-center z-40"
    : "hidden";

  let menu = loading ? (
    <p>loading...</p>
  ) : state.role && state.role[0] === "sudo" ? (
    <div className="flex flex-row space-x-[2.875rem]">
      <Link to="/college">
        <p
          className={
            window.location.pathname === "/college" ? navActive : navInactive
          }
        >
          college
        </p>
      </Link>
      <Link to="/orientation">
        <p
          className={
            window.location.pathname === "/orientation"
              ? navActive
              : navInactive
          }
        >
          orientation
        </p>
      </Link>
      <Link to="/clubs">
        <p
          className={
            window.location.pathname === "/clubs" ? navActive : navInactive
          }
        >
          clubs
        </p>
      </Link>
      <button
        onClick={() => dispatch(logoutUser())}
        className="font-normal text-gray-400 text-[1.125rem]"
      >
        logout
      </button>
    </div>
  ) : (
    <div className="flex flex-row space-x-[2.875rem]">
      {state.role && state.role.includes("focused:college") && (
        <Link to="/college">
          <p
            className={
              window.location.pathname === "/college" ? navActive : navInactive
            }
          >
            college
          </p>
        </Link>
      )}
      {state.role && state.role.includes("focused:orientation") && (
        <Link to="/orientation">
          <p
            className={
              window.location.pathname === "/orientation"
                ? navActive
                : navInactive
            }
          >
            orientation
          </p>
        </Link>
      )}
      {state.role && state.role.includes("focused:clubs") && (
        <Link to="/clubs">
          <p
            className={
              window.location.pathname === "/clubs" ? navActive : navInactive
            }
          >
            clubs
          </p>
        </Link>
      )}
      <button
        onClick={() => dispatch(logoutUser())}
        className="font-normal text-gray-400 text-[1.125rem]"
      >
        logout
      </button>
    </div>
  );

  return (
    <div className={hiddenClass}>
      <Link to="/">
        <img
          src={logo}
          alt="astral"
          className="w-[7rem] h-[3.25rem] object-contain"
        />
      </Link>
      {menu}
    </div>
  );
}

export default Navbar;
