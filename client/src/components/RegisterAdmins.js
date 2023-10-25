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
  const [roles, setRoles] = useState(["clubs", "orientation", "college"]);
  const [checkedState, setCheckedState] = useState(new Array(3).fill(false));
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [generalErrors, setGeneralErrors] = useState("");

  // useEffect(() => {
  //   dispatch({ type: CLEAR_NEW_ADMIN_LINK });
  // }, []);

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

  // const handleSubmit = () => {
  //   //check if role is not selected
  //   //if role is department, check if department is not selected
  //   setGeneralErrors("");
  //   // if (selectedRole === "" || selectedRole === "Select new role")
  //   //   setGeneralErrors("Please select a role");
  //   // else if (
  //   //   (selectedRole === "department" && selectedDepartment === "") ||
  //   //   selectedDepartment === "Select the department for the admin"
  //   // )
  //   //   setGeneralErrors("Please select a department for the admin");
  //   if (selectedRoles.length === 0) {
  //     setGeneralErrors("Please select at least one role for the admin");
  //   } else {
  //     let role = "";
  //     //handle transforming chosen roles to the actual codes
  //     if (
  //       selectedRole !== "department" &&
  //       selectedRole !== "sudo" &&
  //       selectedRole !== "general"
  //     )
  //       role = `focused:${selectedRole.replace(" ", "")}`;
  //     else if (selectedRole === "sudo" || selectedRole === "general")
  //       role = selectedRole;
  //     // else if (selectedRole === "department") {
  //     //   role = `${selectedRole}:${selectedDepartment}`;
  //     // }
  //     if (role !== "") {
  //       let data = {
  //         role: role,
  //       };

  //       dispatch(createNewAdminLink(data));
  //     }
  //   }
  // };

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

      dispatch(createNewAdminLink(temp));
    }
  };

  useEffect(() => {
    //get all departments
    dispatch(getDepartmentsForCampus());
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

  //on render, clear any previous admin link
  //select role
  //submit
  //link is displayed below the button
  //icon to click to copy the link

  return (
    <div className="mt-[26px] w-full items-center overflow-hidden shadow-md sm:rounded-lg">
      {/* <select
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
      </select> */}
      {/* if selected department, show another dropdown to select the departments */}

      {/* {selectedRole === "department" && (
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
      )} */}
      <h3 className="text-[24px] text-[#DFE5F8] text-center font-medium mb-4">
        Select roles for admin:
      </h3>
      <ul className="flex flex-col items-center space-y-2 mb-4">
        {roles.map((role, index) => {
          return (
            <li key={index}>
              <div className="flex space-x-4 justify-start w-40">
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
        text="Create Link"
        className="!mt-[26px]"
      />
      {state.newAdminLink !== "" && (
        <div className="flex flex-col items-center space-y-[1rem] mt-[26px]">
          <SuccessLabel className="!text-center">
            Link for admin created successfully! Copy the link below and send it
            to the admin so they can use it to sign up.
          </SuccessLabel>
          <p className="text-[16px] font-normal text-[#85A1FF]">
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
