import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Spinner } from "react-activity";
import "react-activity/dist/library.css";

import add from "../assets/add.svg";

import Button from "./Button";
import { SET_GENERAL_ERRORS } from "../redux/types";
import axios from "axios";
import TextInput from "./TextInput";
import ErrorLabel from "./ErrorLabel";

export default function GeneralForms() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.data);
  const campusID = localStorage.getItem("AdminCampus");
  const [refreshState, setRefreshState] = useState(false);

  const [forms, setForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  //add
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [formToUpload, setFormToUpload] = useState(null);
  const linkRegex = /^(https?:\/\/)/;
  const [errors, setErrors] = useState({
    title: null,
    link: null,
    general: null,
  });

  //delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteFormData, setDeleteFormData] = useState({});

  //get the forms from db
  useEffect(() => {
    setFormsLoading(true);
    axios
      .get(`/admin/general-forms/${campusID}`)
      .then((res) => {
        setForms([...res.data.forms]);
        setFormsLoading(false);
        setRefreshState(false);
      })
      .catch((error) => {
        console.error(error);
        dispatch({
          type: SET_GENERAL_ERRORS,
          payload: error.response.data.error,
        });
        setFormsLoading(false);
        setRefreshState(false);
      });
  }, [refreshState]);

  //add form -> using modal
  const handleShowAddModal = () => {
    setShowAddModal(!showAddModal);
    setTitle("");
    setLink("");
    setErrors({
      title: null,
      link: null,
      general: null,
    });
    setFormToUpload(null);
  };

  //upload form
  const handleUploadForm = () => {
    const fileInput = document.getElementById("formInput");
    fileInput.click();
  };

  const handleFormChange = (event) => {
    const form = event.target.files[0];
    if (form) {
      setFormToUpload(form);
    }
  };

  const handleSubmit = () => {
    //validation
    let temp = { ...errors };

    if (title.trim() === "") temp.title = "Please enter a title";
    if (link === "" && !formToUpload)
      temp.general = "Please enter a link or upload a new form.";
    if (link !== "" && !linkRegex.test(link))
      temp.link = "Please enter a valid link.";

    if (!temp.title && !temp.link) {
      setSubmitLoading(true);

      if (formToUpload) {
        const formData = new FormData();
        formData.append("file", formToUpload, formToUpload.name);
        axios
          .post(`/admin/upload-pdf/${campusID}`, formData)
          .then((res) => {
            return res.data.downloadUrl;
          })
          .then((downloadUrl) => {
            setFormToUpload(null);
            uploadFormToDB(downloadUrl);
          })
          .catch((error) => {
            console.error(error);
            setSubmitLoading(false);
          });
      } else uploadFormToDB(link);
    }

    setErrors({ ...temp });
  };

  const uploadFormToDB = (linkToUpload) => {
    const data = {
      campusID,
      generalFormID: "",
      type: "link",
      link: linkToUpload,
      title,
      fields: "",
    };

    axios
      .post(`/admin/add-pdf/${campusID}`, data)
      .then((res) => {
        console.log(res.data);
        alert("Form added successfully");
        setSubmitLoading(false);
        setRefreshState(true);
        handleShowAddModal();
      })
      .catch((error) => {
        console.error(error);
        dispatch({
          type: SET_GENERAL_ERRORS,
          payload: error.response.data.error,
        });
        setSubmitLoading(false);
      });
  };

  //delete form -> show confirm delete modal
  const handleShowDeleteModal = (form) => {
    if (form) setDeleteFormData(form);
    else setDeleteFormData({});

    setShowDeleteModal(!showDeleteModal);
  };

  const handleDeleteForm = () => {
    const data = {
      generalFormID: deleteFormData.generalFormID,
    };
    setSubmitLoading(true);
    axios
      .post(`/admin/delete-pdf/${campusID}`, data)
      .then((res) => {
        console.log(res.data);
        handleShowDeleteModal();
        alert("Form deleted successfully");
        setSubmitLoading(false);
        setRefreshState(true);
      })
      .catch((error) => {
        console.error(error);
        dispatch({
          type: SET_GENERAL_ERRORS,
          payload: error.response.data.error,
        });
        setSubmitLoading(false);
      });
  };

  let confirmDeleteModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showDeleteModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={handleShowDeleteModal}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
          disabled={submitLoading}
        >
          ✕
        </button>
        <p className="text-[18px] text-[#DFE5F8] font-normal mt-[1rem] mb=[1rem]">
          Are you sure you want to delete the following form?
        </p>
        <p className="text-[24px] text-[#DFE5F8] font-medium mb-[0.5rem]">
          {deleteFormData.title}
        </p>
        <Button
          onClick={handleDeleteForm}
          text="Delete"
          className="w-full !bg-gray-600 !text-white"
          disabled={submitLoading}
          loading={submitLoading}
        />
        <Button
          onClick={handleShowDeleteModal}
          text="cancel"
          className="w-full"
          disabled={submitLoading}
        />
      </div>
    </div>
  );

  let display = formsLoading ? (
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
  ) : forms.length > 0 ? (
    <table className=" w-full text-left">
      <thead className="text-xs text-gray-700 uppercase bg-gray-700 text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3 text-white">
            Title
          </th>
          <th scope="col" className="px-6 py-3 text-white">
            Type
          </th>
          <th scope="col" class="px-6 py-3">
            <span class="sr-only">View</span>
          </th>
          <th scope="col" class="px-6 py-3">
            <span class="sr-only">Delete</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {forms.map((form, index) => {
          return (
            <tr
              className="text-[16px] border-b bg-gray-800 border-gray-700 hover:bg-gray-600"
              key={index}
            >
              <td
                scope="row"
                className="px-6 py-4 font-bold text-[#DFE5F8] whitespace-nowrap"
              >
                {form.title}
              </td>
              <td scope="row" className="px-6 py-4 font-normal text-[#DFE5F8]">
                {form.type}
              </td>
              <td
                scope="row"
                className="px-6 py-4 font-normal text-[#85A1FF] break-all"
              >
                <a href={form.link} target="_blank" className="">
                  View
                </a>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  className="cursor-pointer font-medium text-[#C4FFF9] text-[#C4FFF9] hover:underline"
                  onClick={() => {
                    handleShowDeleteModal(form);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <p>No general forms found</p>
  );

  let AddModal = (
    <div
      className={
        "modal modal-middle p-2 md:p-20 h-auto " +
        (showAddModal ? "modal-open" : "")
      }
    >
      <div className="modal-box flex flex-col items-center gap-2 bg-[#1A2238] md:p-20">
        <button
          onClick={() => handleShowAddModal()}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
          disabled={submitLoading}
        >
          ✕
        </button>
        <h1 className="text-[20px] font-medium text-[#DFE5F8] text-center">
          Add a new form
        </h1>
        <h2 className="text-[18px] font-normal text-[#DFE5F8] text-center">
          &#42;Please contact us to add an easyFill form.
        </h2>

        <TextInput
          type="text"
          id="title"
          placeholder="Enter the form's title here"
          className="w-full !bg-[#232F52]"
          disabled={submitLoading}
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          manualErrors={{ error: errors.title }}
        />

        <hr class="border border-solid border-gray-500 border-[1px] w-full my-[2rem]"></hr>

        <TextInput
          type="text"
          id="link"
          placeholder="Enter the form's link here"
          className="w-full !bg-[#232F52]"
          disabled={submitLoading || formToUpload}
          onChange={(e) => setLink(e.target.value)}
          value={link}
          manualErrors={{ error: errors.link }}
        />

        <h1 className="text-[18px] font-medium text-[#DFE5F8] text-center">
          or
        </h1>

        <Button
          onClick={handleUploadForm}
          text={formToUpload ? "choose another form" : "upload form"}
          className="!mt-[0.625rem] !bg-[#C4FFF9]"
          disabled={submitLoading || link !== ""}
        />
        <input
          type="file"
          id="formInput"
          onChange={handleFormChange}
          hidden="hidden"
        />

        <ErrorLabel>{errors.general}</ErrorLabel>

        <Button
          onClick={handleSubmit}
          disabled={submitLoading}
          loading={submitLoading}
          text="Add"
          className="!mt-[26px]"
        />
      </div>
    </div>
  );

  return (
    <div className="top-[26px] w-full items-center relative overflow-x-auto shadow-md sm:rounded-lg">
      <div
        style={{ display: "flex", flexDirection: "row", marginBottom: "18px" }}
      >
        <Button
          onClick={() => {
            handleShowAddModal();
          }}
          disabled={submitLoading}
          loading={submitLoading}
          img={add}
          className={
            !submitLoading
              ? "!w-auto px-[20px] !ms-auto"
              : "!w-auto px-[80px] pt-[26px] !ms-auto"
          }
        />
      </div>
      {display}
      {AddModal}
      {confirmDeleteModal}
    </div>
  );
}
