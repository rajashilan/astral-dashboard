import axios from "axios";
import React, { useEffect, useState } from "react";

import Admins from "../components/Admins";
import RegisterAdmins from "../components/RegisterAdmins";

export default function College() {
  //handle tab switching
  const [tab, setTab] = useState("admins");

  let display = tab === "admins" ? <Admins /> : <RegisterAdmins />;

  let activeTabClass =
    "cursor-pointer inline-block p-4 text-[#DFE5F8] font-medium border-b-2 border-[#DFE5F8] rounded-t-lg active";
  let inactiveTabClass =
    "cursor-pointer inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-[#DFE5F8] hover:[#DFE5F8] hover:";

  return (
    <main className="items-center flex flex-col px-[32px] h-screen bg-[#0C111F]">
      <div className="absolute top-[100px] flex flex-col items-center bg-[#131A2E] px-[140px] py-[60px] w-auto rounded-lg">
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
          </ul>
        </div>
        {display}
      </div>
    </main>
  );
}
