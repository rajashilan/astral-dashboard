import React, { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  updateOrientationPagesContent,
  updateOrientationPagesHeader,
  updateOrientationPagesTitle,
  updateSubcontentContent,
  updateSubcontentTitle,
} from "../redux/actions/dataActions";

import edit from "../assets/edit.svg";

import TextInput from "../components/TextInput";
import Button from "../components/Button";

export default function OrientationPagePreview() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.data.orientation);
  const loading = useSelector((state) => state.data.loading);

  const [showPageModal, setShowPageModal] = useState(false);
  const [pageModalData, setPageModalData] = useState({});
  const [subcontentModalData, setSubcontentModalData] = useState({});

  const [showEditPageModal, setShowEditPageModal] = useState(false);
  const [editPageTitle, setEditPageTitle] = useState("");
  const [editPageHeader, setEditPageHeader] = useState("");
  const [editPageContent, setEditPageContent] = useState("");

  const [showEditSubcontentModal, setShowEditSubcontentModal] = useState(false);
  const [editSubcontentTitle, setEditSubcontentTitle] = useState("");
  const [editSubcontentContent, setEditSubcontentContent] = useState("");

  const handleShowPageModal = (id) => {
    let data;
    data = state.pages.find((page) => page.orientationPageID === id);
    setPageModalData(data);
    setShowPageModal(!showPageModal);
  };

  const handleShowEditPageData = () => {
    setShowPageModal(!showPageModal);
    setShowEditPageModal(!showEditPageModal);
    setEditPageTitle("");
    setEditPageHeader("");
    setEditPageContent("");
  };

  const handleShowEditSubcontentData = (id) => {
    let data;
    data = pageModalData.subcontent.find(
      (subcontent) => subcontent.subcontentID === id
    );
    setSubcontentModalData(data);
    setShowPageModal(!showPageModal);
    setShowEditSubcontentModal(!showEditSubcontentModal);
    setEditSubcontentTitle("");
    setEditSubcontentContent("");
  };

  const justShowEditSubcontentData = () => {
    setShowPageModal(!showPageModal);
    setShowEditSubcontentModal(!showEditSubcontentModal);
    setEditSubcontentTitle("");
    setEditSubcontentContent("");
  };

  const handleUpdateEditPage = () => {
    if (editPageTitle !== "") {
      let data = {
        title: editPageTitle,
      };
      dispatch(
        updateOrientationPagesTitle(data, pageModalData.orientationPageID)
      );
    }

    if (editPageHeader !== "") {
      let data = {
        header: editPageHeader,
      };
      dispatch(
        updateOrientationPagesHeader(data, pageModalData.orientationPageID)
      );
    }

    if (editPageContent !== "") {
      let data = {
        content: editPageContent,
      };
      dispatch(
        updateOrientationPagesContent(data, pageModalData.orientationPageID)
      );
    }
  };

  const handleUpdateEditSubcontent = () => {
    if (editSubcontentTitle !== "") {
      let data = {
        title: editSubcontentTitle,
      };
      dispatch(
        updateSubcontentTitle(
          data,
          pageModalData.orientationPageID,
          subcontentModalData.subcontentID
        )
      );
    }

    if (editSubcontentContent !== "") {
      let data = {
        content: editSubcontentContent,
      };
      dispatch(
        updateSubcontentContent(
          data,
          pageModalData.orientationPageID,
          subcontentModalData.subcontentID
        )
      );
    }
  };

  let pages = state.pages.map((page) => {
    return (
      <div
        onClick={() => handleShowPageModal(page.orientationPageID)}
        key={page.orientationPageID}
        className="border-none rounded-lg bg-[#232F52] flex-col py-[1rem] px-[2rem] cursor-pointer"
      >
        <h1 className="text-[20px] text-[#DFE5F8] font-bold">{page.title}</h1>
        <h2 className="text-[16px] text-[#DFE5F8] font-medium mt-[8px]">
          {page.header}
        </h2>
        <p className="text-[14px] text-[#C6CDE2] font-normal clamp-1">
          {page.content}
        </p>
      </div>
    );
  });

  let subcontent =
    pageModalData.subcontent &&
    pageModalData.subcontent.map((content) => {
      return (
        <div
          onClick={() => handleShowEditSubcontentData(content.subcontentID)}
          className="border-none rounded-lg bg-[#232F52] flex-col py-[1rem] px-[2rem] cursor-pointer mb-[0.5rem]"
        >
          <h1 className="text-[18px] font-bold text-[#DFE5F8] text-left clamp-2">
            {content.title}
          </h1>
          <h2 className="text-[16px] font-normal text-[#DFE5F8] text-left">
            {content.content}
          </h2>
        </div>
      );
    });

  let Modal = (
    <div
      className={
        "modal modal-middle h-auto " + (showPageModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={() => setShowPageModal(!showPageModal)}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <button
          onClick={handleShowEditPageData}
          className="btn-sm btn-square btn absolute right-16 top-4 p-1 bg-[#07BEB8]"
        >
          <img src={edit} alt="edit" />
        </button>
        <h1 className="text-[20px] font-bold text-[#DFE5F8] text-center">
          {pageModalData.title}
        </h1>
        <h3 className="text-[16px] font-medium text-[#DFE5F8] text-center">
          {pageModalData.header}
        </h3>
        <p className="text-[14px] text-[#C6CDE2] font-normal">
          {pageModalData.content}
        </p>
        <hr className="border border-solid border-gray-500 border-[1px] w-full my-[2rem]" />
        <h1 className="text-[20px] font-bold text-[#DFE5F8] text-center mb-[1rem] -mt-[1rem]">
          Posts
        </h1>
        {subcontent}
      </div>
    </div>
  );

  let EditPageModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showEditPageModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={handleShowEditPageData}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>

        <TextInput
          type="text"
          id="title"
          className="w-full !mt-[24px] !bg-[#232F52]"
          placeholder={pageModalData.title}
          disabled={loading}
          onChange={(e) => setEditPageTitle(e.target.value)}
          value={editPageTitle}
        />
        <TextInput
          type="text"
          id="header"
          className="w-full !bg-[#232F52]"
          placeholder={pageModalData.header}
          disabled={loading}
          onChange={(e) => setEditPageHeader(e.target.value)}
          value={editPageHeader}
        />
        <TextInput
          type="text"
          id="content"
          className="w-full !bg-[#232F52]"
          placeholder={pageModalData.content}
          disabled={loading}
          onChange={(e) => setEditPageContent(e.target.value)}
          textarea={true}
          value={editPageContent}
        />
        {editPageTitle !== "" ||
        editPageHeader !== "" ||
        editPageContent !== "" ? (
          <Button
            onClick={handleUpdateEditPage}
            text="update"
            x
            className="w-full"
            disabled={loading}
          />
        ) : null}
      </div>
    </div>
  );

  let EditSubcontentModal = (
    <div
      className={
        "modal modal-middle h-auto " +
        (showEditSubcontentModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={justShowEditSubcontentData}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>

        <TextInput
          type="text"
          id="title"
          className="w-full !mt-[24px] !bg-[#232F52]"
          placeholder={
            subcontentModalData.title
              ? subcontentModalData.title
              : "Add your post title here"
          }
          disabled={loading}
          onChange={(e) => setEditSubcontentTitle(e.target.value)}
          value={editSubcontentTitle}
        />
        <TextInput
          type="text"
          id="content"
          className="w-full !bg-[#232F52]"
          placeholder={
            subcontentModalData.content
              ? subcontentModalData.content
              : "Add your post content here"
          }
          disabled={loading}
          onChange={(e) => setEditSubcontentContent(e.target.value)}
          textarea={true}
          value={editSubcontentContent}
        />
        {editSubcontentTitle !== "" || editSubcontentContent !== "" ? (
          <Button
            onClick={handleUpdateEditSubcontent}
            text="update"
            x
            className="w-full"
            disabled={loading}
          />
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {pages}
      {Modal}
      {EditPageModal}
      {EditSubcontentModal}
    </>
  );
}
