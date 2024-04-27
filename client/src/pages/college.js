import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Admins from "../components/Admins";
import RegisterAdmins from "../components/RegisterAdmins";
import GeneralForms from "../components/GeneralForms";

import { useSelector } from "react-redux";
import { checkToken } from "../util/checkToken";

export default function College() {
  //handle tab switching
  const [tab, setTab] = useState("admins");

  const state = useSelector((state) => state.user);
  const role = useSelector((state) => state.user.adminData.role);
  const navigate = useNavigate();

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    if (role) {
      if (!(role.includes("focused:college") || role.includes("sudo")))
        navigate("/");
    }
  }, [role]);

  let display =
    tab === "admins" ? (
      <Admins />
    ) : tab === "register" ? (
      <RegisterAdmins />
    ) : (
      <GeneralForms />
    );

  let activeTabClass =
    "cursor-pointer inline-block p-4 text-[#DFE5F8] font-medium border-b-2 border-[#DFE5F8] rounded-t-lg active";
  let inactiveTabClass =
    "cursor-pointer inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-[#DFE5F8] hover:[#DFE5F8] hover:";

  return (
    <main className="items-center flex flex-col min-h-screen bg-[#0C111F]">
      <div className="max-w-[70%] py-[80px] items-center flex flex-col">
        <div className="text-[16px] font-normal text-center text-[#A7AFC7] border-b border-[#A7AFC7]">
          <ul className="flex flex-wrap -mb-px">
            <li onClick={() => setTab("admins")}>
              <p
                className={tab === "admins" ? activeTabClass : inactiveTabClass}
              >
                Manage Admins
              </p>
            </li>
            <li onClick={() => setTab("register")}>
              <p
                className={
                  tab === "register" ? activeTabClass : inactiveTabClass
                }
              >
                Register an Admin
              </p>
            </li>
            <li onClick={() => setTab("generalform")}>
              <p
                className={
                  tab === "generalform" ? activeTabClass : inactiveTabClass
                }
              >
                Manage Forms
              </p>
            </li>
          </ul>
        </div>
        {display}
      </div>
    </main>
  );
}
