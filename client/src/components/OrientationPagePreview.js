import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  createNewOrientationPost,
  deleteOrientationPage,
  deleteSubcontent,
  deleteSubcontentFile,
  updateOrientationPagesContent,
  updateOrientationPagesHeader,
  updateOrientationPagesTitle,
  updateSubcontentContent,
  updateSubcontentFile,
  updateSubcontentImage,
  updateSubcontentTitle,
} from "../redux/actions/dataActions";

import edit from "../assets/edit.svg";
import bin from "../assets/bin.svg";
import add from "../assets/add.svg";

import TextInput from "../components/TextInput";
import Button from "../components/Button";
import ErrorLabel from "./ErrorLabel";
import WarningLabel from "./WarningLabel";

import axios from "axios";
import { LOADING_DATA, STOP_LOADING_DATA } from "../redux/types";

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);

  const [showAddSubcontentModal, setShowAddSubcontentModal] = useState(false);
  const [addSubcontentTitle, setAddSubcontentTitle] = useState("");
  const [addSubcontentContent, setAddSubcontentContent] = useState("");
  const [errors, setErrors] = useState({});

  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
  const [fileModalData, setFileModalData] = useState({});

  const [image, setImage] = useState(null);

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

  const handleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal);
    setShowEditSubcontentModal(!showEditSubcontentModal);
  };

  const handleDeleteSubcontent = () => {
    dispatch(
      deleteSubcontent(
        pageModalData.orientationPageID,
        subcontentModalData.subcontentID
      )
    );

    setShowDeleteModal(!showDeleteModal);
    setShowPageModal(!showPageModal);
  };

  const handleDeletePageModal = () => {
    setShowDeletePageModal(!showDeletePageModal);
    setShowPageModal(!showPageModal);
  };

  const handleDeletePage = () => {
    dispatch(deleteOrientationPage(pageModalData.orientationPageID));

    setShowDeletePageModal(!showDeletePageModal);
  };

  const handleAddNewPostModal = () => {
    setShowAddSubcontentModal(!showAddSubcontentModal);
    setShowPageModal(!showPageModal);
    setAddSubcontentTitle("");
    setAddSubcontentContent("");
    setErrors({});
  };

  const handleAddNewPostModalImageNull = () => {
    setShowAddSubcontentModal(!showAddSubcontentModal);
    setShowPageModal(!showPageModal);
    setAddSubcontentTitle("");
    setAddSubcontentContent("");
    setImage(null);
    setErrors({});
  };

  const handleDeleteFileModal = (url, filename) => {
    if ((url, filename)) setFileModalData({ url, filename });
    setShowDeleteFileModal(!showDeleteFileModal);
    setShowEditSubcontentModal(!showEditSubcontentModal);
  };

  const handleDeleteFile = () => {
    let data = {
      url: fileModalData.url,
    };

    dispatch(
      deleteSubcontentFile(
        data,
        pageModalData.orientationPageID,
        subcontentModalData.subcontentID
      )
    );
    setShowDeleteFileModal(!showDeleteFileModal);
    setShowPageModal(!showPageModal);
  };

  const handleAddNewPost = () => {
    let data = {
      title: addSubcontentTitle,
      content: addSubcontentContent,
      image: "",
      files: [],
    };

    if (data.title === "" && data.content === "") {
      setErrors({ error: "Please enter either a title or a content" });
    } else {
      //files can only be uploaded after

      if (image) {
        //get download url

        const campusID = localStorage.getItem("AdminCampus");

        const formData = new FormData();
        formData.append("image", image, image.name);

        dispatch({ type: LOADING_DATA });
        axios
          .post(`/subcontent-image/${campusID}`, formData)
          .then((res) => {
            data.image = res.data.downloadUrl;
            return data;
          })
          .then((data) => {
            dispatch(
              createNewOrientationPost(data, pageModalData.orientationPageID)
            );
            handleAddNewPostModal();
          })
          .catch((error) => {
            console.error(error);
            dispatch({ type: STOP_LOADING_DATA });
          });
        setImage(null);
      } else {
        dispatch(
          createNewOrientationPost(data, pageModalData.orientationPageID)
        );
        handleAddNewPostModal();
      }
    }
  };

  const handleUploadImage = () => {
    const fileInput = document.getElementById("imageInput");
    fileInput.click();
  };

  const handleImageChange = (event) => {
    const image = event.target.files[0];
    setImage(image);
  };

  //for editing image and files,
  //upon setting the image, instantly update the image
  //same thing goes for files

  const handleUpdateImage = () => {
    const fileInput = document.getElementById("imageUpdate");
    fileInput.click();
  };

  const handleUpdateImageChange = (event) => {
    const image = event.target.files[0];

    const campusID = localStorage.getItem("AdminCampus");

    const formData = new FormData();
    formData.append("image", image, image.name);

    let data = {
      image: "",
    };

    dispatch({ type: LOADING_DATA });
    axios
      .post(`/subcontent-image/${campusID}`, formData)
      .then((res) => {
        data.image = res.data.downloadUrl;
        subcontentModalData.image = data.image;
        return data;
      })
      .then((data) => {
        //dispatch edit image function
        dispatch(
          updateSubcontentImage(
            data,
            pageModalData.orientationPageID,
            subcontentModalData.subcontentID
          )
        );
      })
      .catch((error) => {
        console.error(error);
        dispatch({ type: STOP_LOADING_DATA });
      });
  };

  //files will be an array
  //files will only be allowed to be uploaded one by one
  //when a new file is uploaded, unshift to the files array for the subcontent

  const handleUpdateFile = () => {
    const fileInput = document.getElementById("fileUpdate");
    fileInput.click();
  };

  const handleUpdateFileChange = (event) => {
    const file = event.target.files[0];

    const campusID = localStorage.getItem("AdminCampus");

    const formData = new FormData();
    formData.append("file", file, file.name);

    let data = {
      file: "",
      filename: "",
    };

    dispatch({ type: LOADING_DATA });
    axios
      .post(`/subcontent-file/${campusID}`, formData)
      .then((res) => {
        data.file = res.data.downloadUrl;
        data.filename = res.data.filename;
        return data;
      })
      .then((data) => {
        //dispatch edit file function
        dispatch(
          updateSubcontentFile(
            data,
            pageModalData.orientationPageID,
            subcontentModalData.subcontentID
          )
        );
        setShowEditSubcontentModal(!showEditSubcontentModal);
        setShowPageModal(!showPageModal);
      })
      .catch((error) => {
        console.error(error);
        dispatch({ type: STOP_LOADING_DATA });
      });
  };

  let pages =
    state.pages &&
    state.pages.map((page) => {
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
          {content.image.length !== 0 && (
            <img
              className="my-[0.5rem] w-full h-auto"
              src={content.image}
              alt="image"
            />
          )}
          <hr className="border border-solid border-gray-500 border-[1px] w-full my-[2rem]" />
          {content.files.length !== 0 &&
            content.files.map((file) => {
              return (
                <a
                  href={file.url}
                  target="_blank"
                  className="text-[18px] mt-[0.5rem] font-medium text-[#BE5007] text-left clamp-1"
                >
                  {file.filename}
                </a>
              );
            })}
        </div>
      );
    });

  let Modal = (
    <div
      className={
        "modal modal-middle h-auto w-[100%] " +
        (showPageModal ? "modal-open" : "")
      }
    >
      <div className="w-9/12 max-w-3xl modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
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
        <button
          onClick={handleDeletePageModal}
          className="btn-sm btn-square btn absolute right-28 top-4 p-1 bg-red-700"
        >
          <img src={bin} alt="delete" />
        </button>
        <h1 className="text-[20px] font-bold text-[#DFE5F8] text-center mt-[2rem]">
          {pageModalData.title}
        </h1>
        <h3 className="text-[16px] font-medium text-[#DFE5F8] text-center">
          {pageModalData.header}
        </h3>
        <p className="text-[14px] text-[#C6CDE2] font-normal">
          {pageModalData.content}
        </p>
        <hr className="border border-solid border-gray-500 border-[1px] w-full my-[2rem]" />
        <div className="flex flex-row items-center justify-center space-x-[2rem] mb-[1rem] -mt-[1rem]">
          <h1 className="text-[20px] font-bold text-[#DFE5F8] text-center]">
            Posts
          </h1>
          <button
            onClick={handleAddNewPostModal}
            className="btn-sm btn-square btn p-1 bg-[#07BEB8]"
          >
            <img src={add} alt="add" />
          </button>
        </div>
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
      <div className="modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={() => {
            justShowEditSubcontentData();
            setImage(null);
          }}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <button
          onClick={handleDeleteModal}
          className="btn-sm btn-square btn absolute right-16 top-4 p-1 bg-red-700"
        >
          <img src={bin} alt="delete" />
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
        <div className="h-full">
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
        </div>
        {subcontentModalData.image ? (
          <>
            <WarningLabel className="!text-gray-300 !text-center">
              Click on image to replace
            </WarningLabel>
            <img
              onClick={handleUpdateImage}
              className="my-[0.5rem] w-full h-auto cursor-pointer"
              src={subcontentModalData.image}
              alt="image"
            />
            <input
              type="file"
              id="imageUpdate"
              accept="image/*"
              onChange={handleUpdateImageChange}
              hidden="hidden"
            />
          </>
        ) : (
          <>
            <Button
              onClick={handleUploadImage}
              text={image ? "choose another image" : "upload image"}
              className="!my-[0.625rem] !bg-[#C4FFF9]"
              disabled={loading}
            />
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              onChange={handleImageChange}
              hidden="hidden"
            />
          </>
        )}
        <hr className="border border-solid border-gray-500 border-[1px] w-full my-[2rem]" />
        {subcontentModalData.files &&
          subcontentModalData.files.map((file) => {
            return (
              <div className="flex flex-row items-center justify-between">
                <a
                  href={file.url}
                  target="_blank"
                  className="text-[18px] font-medium text-[#BE5007] text-left clamp-1 w-[84%]"
                >
                  {file.filename}
                </a>
                <button
                  onClick={() => handleDeleteFileModal(file.url, file.filename)}
                  className="btn-sm btn-square btn p-1 bg-red-700"
                >
                  <img src={bin} alt="delete" />
                </button>
              </div>
            );
          })}

        <Button
          onClick={handleUpdateFile}
          text={image ? "choose another file" : "upload file"}
          className="!mt-[0.625rem] !bg-[#C4FFF9]"
          disabled={loading}
        />
        <input
          type="file"
          id="fileUpdate"
          onChange={handleUpdateFileChange}
          hidden="hidden"
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

  let confirmDeleteModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showDeleteModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={handleDeleteModal}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <p className="text-[18px] text-[#DFE5F8] font-normal mt-[1rem] mb=[1rem]">
          Are you sure you want to delete the following post?
        </p>
        <p className="text-[24px] text-[#DFE5F8] font-medium mb-[0.5rem]">
          {subcontentModalData.title}
        </p>
        <Button
          onClick={handleDeleteSubcontent}
          text="delete"
          x
          className="w-full !bg-gray-600 !text-white"
          disabled={loading}
        />
        <Button
          onClick={handleDeleteModal}
          text="cancel"
          x
          className="w-full"
          disabled={loading}
        />
      </div>
    </div>
  );

  let confirmDeletePageModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showDeletePageModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={handleDeletePageModal}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <p className="text-[18px] text-[#DFE5F8] font-normal mt-[1rem] mb=[1rem]">
          Are you sure you want to delete the following page?
        </p>
        <p className="text-[24px] text-[#DFE5F8] font-medium mb-[0.5rem]">
          {pageModalData.title}
        </p>
        <Button
          onClick={handleDeletePage}
          text="delete"
          x
          className="w-full !bg-gray-600 !text-white"
          disabled={loading}
        />
        <Button
          onClick={handleDeletePageModal}
          text="cancel"
          x
          className="w-full"
          disabled={loading}
        />
      </div>
    </div>
  );

  let confirmDeleteFileModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showDeleteFileModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={handleDeleteFileModal}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <p className="text-[18px] text-[#DFE5F8] font-normal mt-[1rem] mb=[1rem]">
          Are you sure you want to delete the following file?
        </p>
        <p className="text-[24px] text-[#DFE5F8] font-medium mb-[0.5rem] clamp-2">
          {fileModalData.filename}
        </p>
        <Button
          onClick={handleDeleteFile}
          text="delete"
          x
          className="w-full !bg-gray-600 !text-white"
          disabled={loading}
        />
        <Button
          onClick={handleDeleteFileModal}
          text="cancel"
          x
          className="w-full"
          disabled={loading}
        />
      </div>
    </div>
  );

  let AddSubcontentModal = (
    <div
      className={
        "modal modal-middle h-auto " +
        (showAddSubcontentModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={handleAddNewPostModalImageNull}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <h1 className="text-[24px] text-[#DFE5F8] font-medium mb-[1rem]">
          Add a new post
        </h1>
        <div className="flex flex-col space-y-[1rem]">
          <TextInput
            type="text"
            id="title"
            placeholder="Enter the post's title here (either one)"
            className="w-full !bg-[#232F52]"
            disabled={loading}
            onChange={(e) => setAddSubcontentTitle(e.target.value)}
            value={addSubcontentTitle}
          />
          <TextInput
            type="text"
            id="content"
            className="w-full !bg-[#232F52]"
            placeholder="Enter the page's content here (either one)"
            disabled={loading}
            onChange={(e) => setAddSubcontentContent(e.target.value)}
            value={addSubcontentContent}
            textarea={true}
          />
        </div>
        <Button
          onClick={handleUploadImage}
          text={image ? "choose another image" : "upload image"}
          className="!mt-[0.625rem] !bg-[#C4FFF9]"
          disabled={loading}
        />
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          onChange={handleImageChange}
          hidden="hidden"
        />
        <WarningLabel className="!text-gray-300 !text-center">
          Files can only be uploaded after creating a post
        </WarningLabel>
        {errors.error && <ErrorLabel>{errors.error}</ErrorLabel>}
        <Button
          onClick={handleAddNewPost}
          text="create"
          className="!mt-[0.625rem]"
          disabled={loading}
        />
      </div>
    </div>
  );

  return (
    <>
      {pages}
      {Modal}
      {EditPageModal}
      {EditSubcontentModal}
      {AddSubcontentModal}
      {confirmDeleteModal}
      {confirmDeletePageModal}
      {confirmDeleteFileModal}
    </>
  );
}
