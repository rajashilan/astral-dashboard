import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import Button from "./Button";
import WarningLabel from "./WarningLabel";
import ErrorLabel from "./ErrorLabel";
import TextInput from "../components/TextInput";
import { suspendClub } from "../redux/actions/dataActions";

//show pop up when suspend is clicked
//in pop up:
//choose: suspend indefinetely / [input number] of days
//confirm suspension

export default function ApprovedClubs() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.data);
  const loading = useSelector((state) => state.data.loading);

  const [generalErrors, setGeneralErrors] = useState("");
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [suspensionModalData, setSuspensionModalData] = useState({});
  const [numOfDays, setNumOfDays] = useState(0);

  const [approvedClubs, setApprovedClubs] = useState([]);

  useEffect(() => {
    setApprovedClubs(
      state.clubs.filter(
        (club) =>
          (club.approval === "approved" && club.status === "active") ||
          (club.approval === "approved" && club.status === "inactive")
      )
    );
  }, [state.clubs]);

  const handleShowSuspensionModal = (data) => {
    if (data) setSuspensionModalData(data);
    else setSuspensionModalData({});
    setGeneralErrors("");
    setNumOfDays("0");
    setShowSuspensionModal(!showSuspensionModal);
  };

  const handleSuspend = () => {
    //dispatch

    //only allow suspension for a max of 100 days
    if (parseInt(numOfDays) > 100)
      setGeneralErrors(
        "Please enter a maximum suspension length of a 100 days."
      );
    else {
      dispatch(suspendClub(suspensionModalData, numOfDays));
      handleShowSuspensionModal();
    }
  };

  let SuspendModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showSuspensionModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={() => handleShowSuspensionModal()}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <h1 className="text-[24px] text-[#DFE5F8] font-medium mb-[1rem]">
          Suspend Club
        </h1>
        <h3 className="text-[18px] text-[#DFE5F8] font-medium mb-[1rem]">
          {suspensionModalData.name}
        </h3>
        <div className="flex flex-col space-y-[1rem]">
          <TextInput
            type="number"
            min="0"
            max="100"
            id="suspensionDays"
            placeholder="Enter the number of days to suspend here"
            className="w-full !bg-[#232F52]"
            onChange={(e) => setNumOfDays(e.target.value)}
            value={numOfDays}
            disabled={loading}
          />
        </div>
        <WarningLabel className="!text-gray-100 !text-center !mb-[0.5rem]">
          Don't enter the number of days if you wish to suspend the club
          indefinetely.
        </WarningLabel>
        <ErrorLabel>{generalErrors && generalErrors}</ErrorLabel>
        <Button
          onClick={handleSuspend}
          text={
            numOfDays === "0"
              ? "suspend indefinetely"
              : `Suspend for ${numOfDays} days`
          }
          className="!mt-[0.625rem]"
          disabled={loading}
        />
      </div>
    </div>
  );

  let display = state.loading ? (
    <p>Loading clubs...</p>
  ) : approvedClubs.length > 0 ? (
    <table className=" w-full text-left">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Name
          </th>
          <th scope="col" className="px-6 py-3">
            <span className="sr-only">Suspend</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {approvedClubs.map((club, index) => {
          return (
            <tr
              className="text-[16px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              key={index}
            >
              <th
                scope="row"
                className="px-6 py-4 font-bold text-[#DFE5F8] whitespace-nowrap"
              >
                {club.name}
              </th>
              <td className="px-6 py-4 text-right">
                <button
                  className="cursor-pointer font-medium text-[#C4FFF9] dark:text-[#C4FFF9] hover:underline"
                  onClick={() => handleShowSuspensionModal(club)}
                >
                  Suspend
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
      {SuspendModal}
    </div>
  );
}
