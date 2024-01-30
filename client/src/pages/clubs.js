import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PendingClubs from "../components/PendingClubs";
import ApprovedClubs from "../components/ApprovedClubs";
import SuspendedClubs from "../components/SuspendedClubs";
import RegisterAdmins from "../components/RegisterAdmins";

import { useSelector, useDispatch } from "react-redux";
import {
  getAdminClubs,
  getClubs,
  getSaClubs,
} from "../redux/actions/dataActions";
import ClubActivities from "../components/ClubActivities";

export default function Clubs() {
  //handle tab switching
  const [tab, setTab] = useState("pending");

  //get all club's data
  //set it using redux
  //for each tab, filter the club's data and display accordinly

  const state = useSelector((state) => state.user);
  const sa = useSelector((state) => state.user.campusData.sa);
  const role = useSelector((state) => state.user.adminData.role);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!state.authenticated) navigate("/login");
    if (role && role[0] === "focused:studentgovernment") dispatch(getSaClubs());
    else dispatch(getClubs(role, sa));
  }, [role]);

  let display =
    tab === "pending" ? (
      <PendingClubs />
    ) : tab === "approved" ? (
      <ApprovedClubs />
    ) : tab === "suspended" ? (
      <SuspendedClubs />
    ) : (
      <ClubActivities />
    );

  let activeTabClass =
    "cursor-pointer inline-block p-4 text-[#DFE5F8] font-medium border-b-2 border-[#DFE5F8] rounded-t-lg active";
  let inactiveTabClass =
    "cursor-pointer inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-[#DFE5F8] hover:[#DFE5F8] hover:";

  let tabDisplay =
    role && role[0] === "focused:studentgovernment" ? (
      <div className="text-[24px] font-normal text-center text-[#A7AFC7] border-b border-[#A7AFC7]">
        <ul className="flex flex-wrap -mb-px">
          <li>
            <p className={activeTabClass}>Pending Clubs</p>
          </li>
        </ul>
      </div>
    ) : (
      <div className="text-[16px] font-normal text-center text-[#A7AFC7] border-b border-[#A7AFC7]">
        <ul className="flex flex-wrap -mb-px">
          <li onClick={() => setTab("pending")}>
            <p
              className={tab === "pending" ? activeTabClass : inactiveTabClass}
            >
              Pending Clubs
            </p>
          </li>
          <li onClick={() => setTab("approved")}>
            <p
              className={tab === "approved" ? activeTabClass : inactiveTabClass}
            >
              Approved Clubs
            </p>
          </li>
          {/* <li onClick={() => setTab("suspended")}>
            <p
              className={
                tab === "suspended" ? activeTabClass : inactiveTabClass
              }
            >
              Suspended Clubs
            </p>
          </li> */}
          <li onClick={() => setTab("activities")}>
            <p
              className={
                tab === "activities" ? activeTabClass : inactiveTabClass
              }
            >
              Clubs Activities
            </p>
          </li>
        </ul>
      </div>
    );

  return (
    <main className="items-center flex flex-col min-h-screen bg-[#0C111F]">
      <div className="max-w-[70%] py-[80px] items-center flex flex-col">
        {tabDisplay}
        {display}
      </div>
    </main>
  );
}
