import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import Button from "./Button";
import WarningLabel from "./WarningLabel";
import ErrorLabel from "./ErrorLabel";
import TextInput from "../components/TextInput";
import { removeSuspension, suspendClub } from "../redux/actions/dataActions";

//show pop up when suspend is clicked
//in pop up:
//choose: suspend indefinetely / [input number] of days
//confirm suspension

export default function SuspendedClubs() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.data);
  const loading = useSelector((state) => state.data.loading);

  const [suspendedClubs, setSuspendedClubs] = useState([]);

  useEffect(() => {
    setSuspendedClubs(
      state.clubs.filter(
        (club) =>
          club.approval === "approved" && club.status.includes("suspended")
      )
    );
  }, [state.clubs]);

  const handleRemoveSuspension = (club) => {
    dispatch(removeSuspension(club));
  };

  let display = state.loading ? (
    <p>Loading clubs...</p>
  ) : suspendedClubs.length > 0 ? (
    <table className=" w-full text-left">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 bg-gray-700 text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Name
          </th>
          <th scope="col" className="px-6 py-3">
            Duration
          </th>
          <th scope="col" className="px-6 py-3">
            <span className="sr-only">Suspend</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {suspendedClubs.map((club, index) => {
          return (
            <tr
              className="text-[16px] bg-white border-b bg-gray-800 border-gray-700 hover:bg-gray-50 hover:bg-gray-600"
              key={index}
            >
              <th
                scope="row"
                className="px-6 py-4 font-bold text-[#DFE5F8] whitespace-nowrap"
              >
                {club.name}
              </th>
              <th
                scope="row"
                className="px-6 py-4 font-bold text-[#DFE5F8] whitespace-nowrap"
              >
                {club.status.split(":")[1] === "0"
                  ? "Indefinetely"
                  : `${club.status.split(":")[1]} days`}
              </th>
              <td className="px-6 py-4 text-right">
                <button
                  className="cursor-pointer font-medium text-[#C4FFF9] text-[#C4FFF9] hover:underline"
                  onClick={() => handleRemoveSuspension(club)}
                >
                  Remove Suspension
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <p className="text-center">No clubs found</p>
  );

  return (
    <div className="top-[26px] w-full items-center relative overflow-x-auto shadow-md sm:rounded-lg">
      {display}
    </div>
  );
}
