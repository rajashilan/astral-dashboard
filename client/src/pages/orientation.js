import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import OrientationOverview from "../components/OrientationOverview";
import OrientationSubcontent from "../components/OrientationSubcontent";

import { useSelector } from "react-redux";

export default function Orientation() {
  //handle tab switching
  const [tab, setTab] = useState("admins");

  const state = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.authenticated) navigate("/login");
  }, []);

  let display =
    tab === "overview" ? <OrientationOverview /> : <OrientationSubcontent />;

  let activeTabClass =
    "cursor-pointer inline-block p-4 text-[#DFE5F8] font-medium border-b-2 border-[#DFE5F8] rounded-t-lg active";
  let inactiveTabClass =
    "cursor-pointer inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-[#DFE5F8] hover:[#DFE5F8] hover:";

  return (
    <main className="absolute top-0 flex h-screen w-full flex-col justify-center items-center bg-[#0C111F]">
      <div className="absolute top-[100px] flex flex-col items-center bg-[#131A2E] px-[140px] py-[60px] w-auto rounded-lg">
        <div className="text-[16px] font-normal text-center text-[#A7AFC7] border-b border-[#A7AFC7]">
          <ul className="flex flex-wrap -mb-px">
            <li onClick={() => setTab("overview")}>
              <p
                className={
                  tab === "overview" ? activeTabClass : inactiveTabClass
                }
              >
                Main Page
              </p>
            </li>
            <li onClick={() => setTab("subpage")}>
              <p
                className={
                  tab === "subpage" ? activeTabClass : inactiveTabClass
                }
              >
                Sub Pages
              </p>
            </li>
          </ul>
        </div>
        {display}
      </div>
    </main>
  );
}
