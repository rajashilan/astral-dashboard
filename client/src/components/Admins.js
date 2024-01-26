import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  adminActivation,
  getAdminsForCampus,
  getDepartmentsForCampus,
  updateAdminsRole,
} from "../redux/actions/dataActions";

import Button from "./Button";
import ErrorLabel from "./ErrorLabel";

export default function Admins() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.data);
  const sa = useSelector((state) => state.user.campusData.sa);

  const [generalErrors, setGeneralErrors] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({});
  const [roles, setRoles] = useState(["clubs", "orientation", "college"]);
  const [checkedState, setCheckedState] = useState(new Array(3).fill(false));
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    // retrieve all admins data for the particular campus on load
    dispatch(getAdminsForCampus());
    //get all departments
    //dispatch(getDepartmentsForCampus());
  }, []);

  // useEffect(() => {
  //   roles.pop();
  //   let tempRoles = roles;
  //   tempRoles.push({
  //     role: "department",
  //     departmentList: state.departments,
  //   });

  //   setRoles(tempRoles);
  // }, [state.departments]);

  const stringifyRoles = (roles) => {
    if (roles[0] === "sudo") return roles[0];

    let temp = [];
    roles.forEach((role) => temp.push(role.split(":")[1]));
    return temp.toString();
  };

  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    let temp = [];

    updatedCheckedState.forEach((state, index) => {
      if (state === true) temp.push(roles[index]);
    });

    setSelectedRoles(temp);
    setCheckedState(updatedCheckedState);
  };

  const handleShowEditModal = (userID, name, role, active, email) => {
    setShowEditModal(!showEditModal);
    const modalData = {
      userID: userID,
      name: name,
      role: role,
      active: active,
      email: email,
    };
    setEditModalData(modalData);
  };

  const handleSubmit = () => {
    setGeneralErrors("");

    if (selectedRoles.length === 0)
      setGeneralErrors("Please select at least one role for the admin");
    else {
      let temp = [...selectedRoles];

      //handle transforming chosen roles to the actual codes
      if (temp.length === 3) temp = ["sudo"];
      else
        temp.forEach((role, index) => {
          if (role !== "sudo") temp[index] = `focused:${role.replace(" ", "")}`;
        });

      let data = {
        role: [...temp],
        userID: editModalData.userID,
        name: editModalData.name,
        active: editModalData.active,
        email: editModalData.email,
      };

      dispatch(updateAdminsRole(data));
      setShowEditModal(!showEditModal);
    }
  };

  //for activating/deactivating user
  //show a pop up modal and ask admin to type the admin's email to confirm
  //depending on activating or deactivating, send userID as deactivateAdminID or reactivateAdminID
  //also send all of the user's other details in data to be used in data reducer

  const handleAdminActivation = (
    userID,
    name,
    role,
    active,
    email,
    activationType
  ) => {
    let data = {
      userID: userID,
      name: name,
      role: role,
      active: !active,
      email: email,
      activationType: activationType,
    };

    if (activationType === "activate") data.reactivateAdminID = userID;
    else data.deactivateAdminID = userID;
    dispatch(adminActivation(data));
  };

  let display = state.loading ? (
    <p>Loading admins...</p>
  ) : state.admins.length > 0 ? (
    <table className=" w-full text-left">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Name
          </th>
          <th scope="col" className="px-6 py-3">
            Role(s)
          </th>
          <th scope="col" class="px-6 py-3">
            <span class="sr-only">Edit Role</span>
          </th>
          <th scope="col" class="px-6 py-3">
            <span class="sr-only">Activate</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {state.admins.map((admin, index) => {
          return (
            <tr
              className="text-[16px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              key={index}
            >
              <th
                scope="row"
                className="px-6 py-4 font-bold text-[#DFE5F8] whitespace-nowrap"
              >
                {admin.name}
              </th>
              <td className="px-6 py-4 font-normal text-[#DFE5F8]">
                {admin.role[0] === "focused:studentgovernment"
                  ? "student government"
                  : stringifyRoles(admin.role)}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  className={
                    admin.role[0] === "focused:studentgovernment"
                      ? "font-medium text-gray-500"
                      : "cursor-pointer font-medium text-[#C4FFF9] dark:text-[#C4FFF9] hover:underline"
                  }
                  onClick={() =>
                    handleShowEditModal(
                      admin.userID,
                      admin.name,
                      admin.role,
                      admin.active,
                      admin.email
                    )
                  }
                  disabled={admin.role[0] === "focused:studentgovernment"}
                >
                  Edit Role
                </button>
              </td>
              {admin.active === true ? (
                <td className="px-6 py-4 text-right">
                  <p
                    onClick={() =>
                      handleAdminActivation(
                        admin.userID,
                        admin.name,
                        admin.role,
                        admin.active,
                        admin.email,
                        "deactivate"
                      )
                    }
                    className="cursor-pointer font-medium text-gray-400 dark:text-gray-400 hover:underline"
                  >
                    Deactivate
                  </p>
                </td>
              ) : (
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      if (
                        sa !== "" &&
                        admin.role[0] === "focused:studentgovernment"
                      )
                        alert(
                          "Cannot activate while another student government account is active. Deactivate the active account to continue."
                        );
                      else
                        handleAdminActivation(
                          admin.userID,
                          admin.name,
                          admin.role,
                          admin.active,
                          admin.email,
                          "activate"
                        );
                    }}
                    className={
                      sa !== "" && admin.role[0] === "focused:studentgovernment"
                        ? "font-medium text-gray-500 "
                        : "cursor-pointer font-medium text-[#C4FFF9] dark:text-[#C4FFF9] hover:underline"
                    }
                  >
                    Activate
                  </button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <p>No admins found</p>
  );

  let Modal = (
    <div
      className={
        "modal modal-middle p-2 md:p-20 h-auto " +
        (showEditModal ? "modal-open" : "")
      }
    >
      <div className="overflow-visible modal-box flex flex-col items-center gap-2 bg-[#232F52] md:p-20">
        <button
          onClick={() => setShowEditModal(!showEditModal)}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <h1 className="text-[20px] font-medium text-[#DFE5F8] text-center">
          Edit {editModalData.name}'s role
        </h1>
        <h2 className="text-[18px] font-normal text-[#DFE5F8] text-center">
          Current role(s): {editModalData.role && editModalData.role.toString()}
        </h2>

        <ul className="space-y-2 mb-4 mt-4">
          {roles.map((role, index) => {
            return (
              <li key={index}>
                <div className="flex space-x-4 items-center">
                  <input
                    className="w-6 h-6"
                    type="checkbox"
                    id={`custom-checkbox-${index}`}
                    name={role}
                    value={role}
                    checked={checkedState[index]}
                    onChange={() => handleOnChange(index)}
                  />
                  <label
                    className="text-[18px] text-[#DFE5F8] font-normal"
                    htmlFor={`custom-checkbox-${index}`}
                  >
                    {role}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        <ErrorLabel className="!mt-[16px] !-mb-[10px]">
          {generalErrors}
        </ErrorLabel>
        <Button
          onClick={handleSubmit}
          disabled={state.loading}
          text="Update"
          className="!mt-[26px]"
        />
      </div>
    </div>
  );

  return (
    <div className="top-[26px] w-full items-center relative overflow-x-auto shadow-md sm:rounded-lg">
      {display}
      {Modal}
    </div>
  );
}
