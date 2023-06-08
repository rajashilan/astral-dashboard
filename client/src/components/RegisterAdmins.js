import React, { useEffect, useState } from "react";

import Button from "./Button";
import ErrorLabel from "./ErrorLabel";
import SuccessLabel from "./SuccessLabel";
import WarningLabel from "./WarningLabel";

import { useDispatch, useSelector } from "react-redux";
import {
  getDepartmentsForCampus,
  createNewAdminLink,
} from "../redux/actions/dataActions";
import { CLEAR_NEW_ADMIN_LINK } from "../redux/types";

export default function RegisterAdmins() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.data);

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
  const [generalErrors, setGeneralErrors] = useState("");

  // useEffect(() => {
  //   dispatch({ type: CLEAR_NEW_ADMIN_LINK });
  // }, []);

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
        let data = {
          role: role,
        };

        dispatch(createNewAdminLink(data));
      }
    }
  };

  useEffect(() => {
    //get all departments
    dispatch(getDepartmentsForCampus());
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

  //on render, clear any previous admin link
  //select role
  //submit
  //link is displayed below the button
  //icon to click to copy the link

  return (
    <div className="mt-[26px] w-full items-center overflow-hidden shadow-md sm:rounded-lg">
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
        text="Create Link"
        className="!mt-[26px]"
      />
      {state.newAdminLink !== "" && (
        <div className="flex flex-col items-center space-y-[1rem] mt-[26px]">
          <SuccessLabel className="!text-center">
            Link for admin created successfully! Copy the link below and send it
            to the admin so they can use it to sign up.
          </SuccessLabel>
          <p className="text-[16px] font-normal text-white">
            {state.newAdminLink}
          </p>
          <WarningLabel>
            Please copy the link before refreshing, you'll only see this link
            once!
          </WarningLabel>
        </div>
      )}
    </div>
  );
}
