import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import OrientationOverview from "../components/OrientationOverview";
import OrientationSubcontent from "../components/OrientationSubcontent";

import add from "../assets/add.svg";

import TextInput from "../components/TextInput";
import Button from "../components/Button";

import { useDispatch, useSelector } from "react-redux";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createNewOrientationPage } from "../redux/actions/dataActions";

const formSchema = z.object({
  title: z.string().min(1, { message: "Please enter a title" }),
});

export default function Orientation() {
  const userState = useSelector((state) => state.user);
  const state = useSelector((state) => state.data.orientation.overview);
  const loading = useSelector((state) => state.data.loading);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [pageHeader, setPageHeader] = useState("");
  const [pageContent, setPageContent] = useState("");

  const titleInputRef = useRef();

  useEffect(() => {
    if (!userState.authenticated) navigate("/login");
  }, []);

  //show add page modal
  //allow user to add title (compulsory)
  //header and content (optional)
  //user add posts in page modal so not here

  const onFormSubmit = (data) => {
    let pageData = {
      title: data["title"],
      header: pageHeader,
      content: pageContent,
      video: "",
      image: "",
      files: [],
    };
    console.log(pageData);
    dispatch(createNewOrientationPage(pageData, state.orientationID));
    handleNewPageModal();
  };

  const handleNewPageModal = () => {
    setShowAddPageModal(!showAddPageModal);
    if (titleInputRef.current) titleInputRef.current.value = "";
    setPageHeader("");
    setPageContent("");
  };

  let AddPageModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showAddPageModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={() => setShowAddPageModal(!showAddPageModal)}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <h1 className="text-[24px] text-[#DFE5F8] font-medium mb-[1rem]">
          Add a new page
        </h1>
        <div className="flex flex-col space-y-[1rem]">
          <TextInput
            type="text"
            id="title"
            placeholder="Enter the page's title here"
            className="w-full !bg-[#232F52]"
            register={register}
            errors={errors}
            disabled={loading}
            ref={titleInputRef}
          />
          <TextInput
            type="text"
            id="header"
            className="w-full !bg-[#232F52]"
            placeholder="Enter the page's header here (optional)"
            disabled={loading}
            onChange={(e) => setPageHeader(e.target.value)}
            value={pageHeader}
          />
          <TextInput
            type="text"
            id="content"
            textarea={true}
            className="w-full !bg-[#232F52]"
            placeholder="Enter the page's content here (optional)"
            disabled={loading}
            onChange={(e) => setPageContent(e.target.value)}
            value={pageContent}
          />
        </div>
        <Button
          onClick={handleSubmit(onFormSubmit)}
          text="create"
          className="!mt-[0.625rem]"
          disabled={loading}
        />
      </div>
    </div>
  );

  return (
    <main className="absolute top-0 overflow-auto py-[100px] scrollbar-hide flex h-full w-full justify-center items-center bg-[#0C111F]">
      <div className="mt-[180px] flex flex-col items-center bg-[#131A2E] px-[140px] py-[60px] max-w-[80%] rounded-lg">
        <h1 className="text-[24px] text-[#DFE5F8] font-medium">
          Orientation title
        </h1>
        <OrientationOverview />
        <hr className="border border-solid border-gray-500 border-[1px] w-full my-[2rem]" />
        <div className="flex flex-row items-center justify-center space-x-[2rem]">
          <h1 className="text-[24px] text-[#DFE5F8] font-medium">Pages</h1>
          <button
            onClick={handleNewPageModal}
            className="btn-sm btn-square btn p-1 bg-[#07BEB8]"
          >
            <img src={add} alt="add" />
          </button>
        </div>
        <OrientationSubcontent />
      </div>
      <div className="h-[80px] bg-[#0C111F] flex-col"></div>
      {AddPageModal}
    </main>
  );
}
