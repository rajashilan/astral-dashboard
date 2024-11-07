import React, { useEffect, useState, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Spinner } from "react-activity";
import "react-activity/dist/library.css";

import Button from "./Button";
import WarningLabel from "./WarningLabel";
import ErrorLabel from "./ErrorLabel";
import TextInput from "../components/TextInput";
import {
  updateClubRole,
  getApprovedClubs,
  getClubMembers,
  suspendClub,
} from "../redux/actions/dataActions";
import { CLEAR_CLUB_MEMBERS } from "../redux/types";

//show pop up when suspend is clicked
//in pop up:
//choose: suspend indefinetely / [input number] of days
//confirm suspension

export default function ApprovedClubs() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.data);
  const clubMembers = useSelector((state) => state.data.clubMembers);
  const approvedClubs = useSelector((state) => state.data.approvedClubs);
  const loading = useSelector((state) => state.data.loading);

  const memberSelectorRef = useRef(null);

  const [generalErrors, setGeneralErrors] = useState("");
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [suspensionModalData, setSuspensionModalData] = useState({});
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageModalData, setManageModalData] = useState({});
  const [manageModalLoading, setManageModalLoading] = useState(false);

  const [currentPresident, setCurrentPresident] = useState({});
  const [newPresident, setNewPresident] = useState({});

  const [currentClubRoles, setCurrentClubRoles] = useState([]);
  const [currentClubOriginalMembers, setCurrentClubOriginalMembers] = useState(
    []
  );
  const [newMemberForRole, setNewMemberForRole] = useState("");
  const [updateRoleModalData, setUpdateRoleModalData] = useState({});
  const [showUpdateRoleModal, setShowUpdateRoleModal] = useState(false);

  const [numOfDays, setNumOfDays] = useState(0);

  const stringSpaceRegex = /\s+/g;

  function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  //need to get all the list of roles

  useEffect(() => {
    dispatch({ type: CLEAR_CLUB_MEMBERS });
    dispatch(getApprovedClubs());
  }, []);

  //handle setting loading to false after getting club members
  useEffect(() => {
    if (clubMembers.length > 0 && !isEmpty(manageModalData)) {
      setManageModalLoading(false);

      //set the other roles, if the role isn't member
      let tempCurrentClubRoles = [];
      let tempCurrentClubOriginalMembers = {};

      Object.values(manageModalData.roles).forEach((role) => {
        if (role.name !== "member") {
          //access to role name, and the userID who has that role
          //if it is not assigned, set userID, memberID, and name as null

          if (role.name === "president") {
            //set the president
            let index = clubMembers.findIndex(
              (member) => member.role === "president"
            );
            setCurrentPresident({
              userID: clubMembers[index].userID,
              memberID: clubMembers[index].memberID,
              name: clubMembers[index].name,
              role: role.name,
            });
          } else {
            tempCurrentClubRoles.push(role.name);
            if (role.userID === "") {
              tempCurrentClubOriginalMembers[
                role.name.replace(stringSpaceRegex, "")
              ] = {
                role: role.name,
                userID: null,
                memberID: null,
                name: null,
              };
            } else {
              const index = clubMembers.findIndex(
                (member) => member.role === role.name
              );
              tempCurrentClubOriginalMembers[
                role.name.replace(stringSpaceRegex, "")
              ] = {
                role: role.name,
                userID: clubMembers[index].userID,
                memberID: clubMembers[index].memberID,
                name: clubMembers[index].name,
              };
            }
          }
        }
      });
      setCurrentClubRoles(tempCurrentClubRoles);
      setCurrentClubOriginalMembers(tempCurrentClubOriginalMembers);
    }
  }, [clubMembers, manageModalData]);

  useEffect(() => {
    if (!isEmpty(updateRoleModalData)) setManageModalLoading(false);
  }, [updateRoleModalData]);

  const handleShowSuspensionModal = (data) => {
    if (data) setSuspensionModalData(data);
    else setSuspensionModalData({});
    setGeneralErrors("");
    setNumOfDays("0");
    setShowSuspensionModal(!showSuspensionModal);
  };

  const handleShowManageModal = (data) => {
    if (data) {
      setManageModalData(data);
      setManageModalLoading(true);
      dispatch(getClubMembers(data.clubID));
    } else {
      setManageModalData({});
      setGeneralErrors("");
      dispatch({ type: CLEAR_CLUB_MEMBERS });
    }
    setShowManageModal(!showManageModal);
  };

  const handleShowUpdateRoleModal = (data) => {
    // setManageModalLoading(true) basically to avoid role.name is undefined error
    if (data) {
      setUpdateRoleModalData(data);
      setManageModalLoading(true);
    } else {
      setUpdateRoleModalData({});
      setGeneralErrors("");
      setNewMemberForRole("");
      memberSelectorRef.current.selectedIndex = 0;
    }
    setShowUpdateRoleModal(!showUpdateRoleModal);
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

  const handleSetNewPresident = (e) => {
    if (e.target.value === "Select new president") {
      setNewPresident({});
      return;
    }
    let index = clubMembers.findIndex(
      (member) => member.userID === e.target.value
    );
    setNewPresident({
      userID: clubMembers[index].userID,
      memberID: clubMembers[index].memberID,
    });
  };

  const handleSetNewRole = (e) => {
    setGeneralErrors("");
    //newMemberForRole has the userID of the new member
    //data for the new role is in updateRoleModalData

    //1. check if the selection is not the default selection
    //2. check if the member the role is being assigned to is the current president
    if (
      newMemberForRole === "Select new president" ||
      newMemberForRole === ""
    ) {
      setGeneralErrors("Please select a member.");
      return;
    } else if (newMemberForRole === currentPresident.userID) {
      setGeneralErrors(
        "This member is the current president. Please reassign president role to another member to continue."
      );
      return;
    }

    let data = {
      clubID: manageModalData.clubID,
      previousMember: null,
      newMember: null,
      newRole: updateRoleModalData.role,
      newRoleWithoutSpacing: updateRoleModalData.role.replace(
        stringSpaceRegex,
        ""
      ),
    };

    //previous member if exists
    if (updateRoleModalData.userID) {
      data.previousMember = {
        userID: updateRoleModalData.userID,
        memberID: updateRoleModalData.memberID,
      };
    }

    //find new member
    let index = clubMembers.findIndex(
      (member) => member.userID === newMemberForRole
    );
    data.newMember = {
      userID: clubMembers[index].userID,
      memberID: clubMembers[index].memberID,
    };

    dispatch(updateClubRole(data));

    //what if member had a previous role?
    let prevRole = Object.values(manageModalData.roles).find(
      (role) => role.userID === data.newMember.userID
    );

    if (prevRole) {
      prevRole = prevRole.name.replace(stringSpaceRegex, "");
      manageModalData.roles[prevRole].userID = "";
      manageModalData.roles[prevRole].memberID = "";
    }

    //need to reflect changes in manage modal data and in approve clubs (done thru redux)
    manageModalData.roles[data.newRoleWithoutSpacing].userID =
      data.newMember.userID;
    manageModalData.roles[data.newRoleWithoutSpacing].memberID =
      data.newMember.memberID;
    updateRoleModalData.userID = data.newMember.userID;
    updateRoleModalData.memberID = data.newMember.memberID;
    updateRoleModalData.name = clubMembers[index].name;
  };

  const handleChangePresident = () => {
    let data = {
      clubID: manageModalData.clubID,
      previousPresident: currentPresident,
      newPresident,
    };
    dispatch(updateClubRole(data));
    handleShowManageModal();
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
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-gray-800 pt-1 text-white"
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
          loading={loading}
        />
      </div>
    </div>
  );

  let ManageModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showManageModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={() => handleShowManageModal()}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-gray-800 pt-1 text-white"
        >
          ✕
        </button>
        <h3 className="text-[20px] text-[#DFE5F8] font-medium mb-[1rem]">
          {manageModalData.name} - manage roles
        </h3>
        <a
          href={
            manageModalData.clubCreationDocs &&
            manageModalData.clubCreationDocs[
              manageModalData.clubCreationDocs.length - 1
            ]
          }
          target="_blank"
          className="font-normal text-[#85A1FF] break-all mb-2"
        >
          Download form
        </a>
        <div className="flex flex-col">
          {manageModalLoading ? (
            <p className="text-[16px] text-[#DFE5F8] font-normal">
              loading members
            </p>
          ) : (
            <div className="text-left self-center  space-y-[0.5rem]">
              <p
                onClick={() => {
                  handleShowUpdateRoleModal(currentPresident);
                }}
                className="cursor-pointer text-[16px] text-[#DFE5F8] font-normal px-2 py-1 border border-gray-500 rounded-lg"
              >{`current president: ${currentPresident.name}`}</p>
              {Object.values(currentClubOriginalMembers).map((role) => {
                return (
                  <p
                    key={role.role}
                    onClick={() => {
                      handleShowUpdateRoleModal(role);
                    }}
                    className="cursor-pointer text-[16px] text-[#DFE5F8] font-normal px-2 py-1 border border-gray-500 rounded-lg"
                  >
                    {role.name
                      ? `current ${role.role}: ${role.name}`
                      : `current ${role.role}: N/A`}
                  </p>
                );
              })}
            </div>
          )}
          <p className="text-[12px] text-[#DFE5F8] font-normal mt-5">
            *Click on a role to make changes
          </p>
        </div>
      </div>
    </div>
  );

  let UpdateRoleModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showUpdateRoleModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={() => handleShowUpdateRoleModal()}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-gray-800 pt-1 text-white"
        >
          ✕
        </button>
        <h3 className="text-[20px] text-[#DFE5F8] font-medium mb-[1rem]">
          {updateRoleModalData.role} - manage role
        </h3>
        <div className="flex flex-col">
          {manageModalLoading ? (
            <p className="text-[16px] text-[#DFE5F8] font-normal">
              loading member
            </p>
          ) : (
            <div className="text-left self-center  space-y-[0.5rem]">
              <p className="cursor-pointer text-[16px] text-[#DFE5F8] font-normal">
                {updateRoleModalData.name
                  ? `current ${updateRoleModalData.role}: ${updateRoleModalData.name}`
                  : `current ${updateRoleModalData.role}: N/A`}
              </p>
            </div>
          )}
        </div>
        {/* show president selection first */}
        <div className="flex flex-col space-y-[1rem]">
          <select
            disabled={loading}
            id="members"
            className="mt-[14px] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => {
              setNewMemberForRole(e.target.value);
            }}
            ref={memberSelectorRef}
          >
            <option selected>{`Select new ${updateRoleModalData.role}`}</option>
            {clubMembers.map((item) => {
              return (
                item.role !== updateRoleModalData.role && (
                  <option key={item.name} value={item.userID}>
                    {item.name}
                  </option>
                )
              );
            })}
          </select>
        </div>
        <ErrorLabel>{generalErrors && generalErrors}</ErrorLabel>
        <Button
          onClick={handleSetNewRole}
          text="update"
          className="!mt-[0.625rem]"
          disabled={loading}
          loading={loading}
        />
      </div>
    </div>
  );

  let display = state.loading ? (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Spinner size={60} color="#C4FFF9" />
    </div>
  ) : approvedClubs.length > 0 ? (
    <table className=" w-full text-left">
      <thead className="text-xs text-gray-700 uppercase bg-gray-700 text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3 text-white">
            Name
          </th>
          <th scope="col" className="px-6 py-3 text-white">
            <span className="sr-only">Manage Club</span>
          </th>
          {/* <th scope="col" className="px-6 py-3">
            <span className="sr-only">Suspend</span>
          </th> */}
        </tr>
      </thead>
      <tbody>
        {approvedClubs.map((club, index) => {
          return (
            <tr
              className="text-[16px] border-b bg-gray-800 border-gray-700 hover:bg-gray-600"
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
                  className="cursor-pointer font-medium text-[#C4FFF9] text-[#C4FFF9] hover:underline"
                  onClick={() => handleShowManageModal(club)}
                >
                  Manage Club
                </button>
              </td>
              {/* <td className="px-6 py-4 text-right">
                <button
                  className="cursor-pointer font-medium text-[#C4FFF9] text-[#C4FFF9] hover:underline"
                  onClick={() => handleShowSuspensionModal(club)}
                >
                  Suspend
                </button>
              </td> */}
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
      {ManageModal}
      {UpdateRoleModal}
    </div>
  );
}
