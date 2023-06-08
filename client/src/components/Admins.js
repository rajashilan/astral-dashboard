import React, { useEffect, useState } from "react";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import {
  getAdminsForCampus,
  getDepartmentsForCampus,
  updateAdminsRole,
} from "../redux/actions/dataActions";

import Button from "./Button";
import ErrorLabel from "./ErrorLabel";

export default function Admins() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.data);

  const [generalErrors, setGeneralErrors] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({});
  const [roles, setRoles] = useState([
    {
      role: "sudo",
    },
    {
      role: "general",
    },
    {
      role: "clubs",
    },
    {
      role: "orientation",
    },
    {
      role: "college",
    },
    {
      role: "staff list",
    },
    {
      role: "department",
      departmentList: state.departments,
    },
  ]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    // retrieve all admins data for the particular campus on load
    dispatch(getAdminsForCampus());
    //get all departments
    dispatch(getDepartmentsForCampus());
    console.log(roles[roles.length - 1].departmentList);
  }, []);

  useEffect(() => {
    roles.pop();
    let tempRoles = roles;
    tempRoles.push({
      role: "department",
      departmentList: state.departments,
    });

    setRoles(tempRoles);
  }, [state.departments]);

  //upon clicking edit role, show a pop up modal
  //display admin name, and role
  //allow admin to choose new roles as dropdown
  //send userID(changing admin) and campusID

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
    //check if role is not selected
    //if role is department, check if department is not selected
    setGeneralErrors("");
    if (selectedRole === "" || selectedRole === "Select new role")
      setGeneralErrors("Please select a role");
    else if (
      (selectedRole === "department" && selectedDepartment === "") ||
      selectedDepartment === "Select the department for the admin"
    )
      setGeneralErrors("Please select a department for the admin");
    else {
      let role = "";
      //handle transforming chosen roles to the actual codes
      if (
        selectedRole !== "department" &&
        selectedRole !== "sudo" &&
        selectedRole !== "general"
      )
        role = `focused:${selectedRole.replace(" ", "")}`;
      else if (selectedRole === "sudo" || selectedRole === "general")
        role = selectedRole;
      else if (selectedRole === "department") {
        role = `${selectedRole}:${selectedDepartment}`;
      }
      if (role !== "") {
        const campusID = localStorage.getItem("AdminCampus");

        let data = {
          role: role,
          userID: editModalData.userID,
          name: editModalData.name,
          active: editModalData.active,
          email: editModalData.email,
        };

        console.log(data);
        dispatch(updateAdminsRole(data));
        setShowEditModal(!showEditModal);
      }
    }
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
            Role
          </th>
          <th scope="col" class="px-6 py-3">
            <span class="sr-only">Edit Role</span>
          </th>
          <th scope="col" class="px-6 py-3">
            <span class="sr-only">Delete</span>
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
                {admin.role}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  className="font-medium text-[#C4FFF9] dark:text-[#C4FFF9] hover:underline"
                  onClick={() =>
                    handleShowEditModal(
                      admin.userID,
                      admin.name,
                      admin.role,
                      admin.active,
                      admin.email
                    )
                  }
                >
                  Edit Role
                </button>
              </td>
              <td className="px-6 py-4 text-right">
                <a
                  href="#"
                  className="font-normal text-gray-400 dark:text-gray-400 hover:underline"
                >
                  Delete
                </a>
              </td>
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
        <h1 className="text-[20px] font-medium text-[#DFE5F8]">
          Edit {editModalData.name}'s role
        </h1>
        <h2 className="text-[18px] font-normal text-[#DFE5F8]">
          Current role: {editModalData.role}
        </h2>

        <select
          id="roles"
          class="mt-[14px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setSelectedDepartment("");
          }}
        >
          <option selected>Select new role</option>
          {roles.map((item) => (
            <option key={item.role} value={item.role}>
              {item.role}
            </option>
          ))}
        </select>

        {/* if selected department, show another dropdown to select the departments */}

        {selectedRole === "department" && (
          <select
            id="departments"
            class="mt-[6px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option selected>Select the department for the admin</option>
            {Object.keys(roles[roles.length - 1].departmentList).map(
              (item, index) => (
                <option
                  key={roles[roles.length - 1].departmentList[item].id}
                  value={roles[roles.length - 1].departmentList[item].id}
                >
                  {roles[roles.length - 1].departmentList[item].name}
                </option>
              )
            )}
          </select>
        )}
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
