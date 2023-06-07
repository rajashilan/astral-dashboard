import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  getAdminsForCampus,
  getDepartmentsForCampus,
} from "../redux/actions/dataActions";

export default function Admins() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.data);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({});
  const [roles] = useState([
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

  useEffect(() => {
    // retrieve all admins data for the particular campus on load
    dispatch(getAdminsForCampus());
    //get all departments
    dispatch(getDepartmentsForCampus());
  }, []);

  //upon clicking edit role, show a pop up modal
  //display admin name, and role
  //allow admin to choose new roles as dropdown
  //send userID(changing admin) and campusID

  const handleShowEditModal = (userID, name, role) => {
    setShowEditModal(!showEditModal);
    const modalData = {
      userID: userID,
      name: name,
      role: role,
    };
    setEditModalData(modalData);
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
                    handleShowEditModal(admin.userID, admin.name, admin.role)
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

        <div className="dropdown dropdown-hover">
          <label tabIndex={0} className="btn m-1">
            Available roles:
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            {roles.map((role) => {
              return (
                <li>
                  <p>{role.role}</p>
                </li>
              );
            })}
          </ul>
        </div>
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
