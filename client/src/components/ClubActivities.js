import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Spinner } from "react-activity";
import "react-activity/dist/library.css";

import Button from "./Button";
import WarningLabel from "./WarningLabel";
import ErrorLabel from "./ErrorLabel";
import TextInput from "../components/TextInput";
import {
  createNotification,
  getClubActivities,
  handleEventActivity,
  handleGalleryActivity,
  ignoreReport,
  setClubEventToTrue,
  setClubGalleryToTrue,
  suspendPost,
} from "../redux/actions/dataActions";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import axios from "axios";
import { getReports } from "../redux/actions/dataActions";

const formSchema = z.object({
  rejectionReason: z
    .string()
    .min(1, { message: "Please enter a reason for rejecting the activity." }),
});

//show pop up when suspend is clicked
//in pop up:
//choose: suspend indefinetely / [input number] of days
//confirm suspension

export default function ClubActivities() {
  const {
    register,
    handleSubmit,
    clearErrors,
    resetField,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const dispatch = useDispatch();
  const state = useSelector((state) => state.data);
  const loading = useSelector((state) => state.data.loading);
  const clubActivities = useSelector((state) => state.data.clubActivities);
  const reports = useSelector((state) => state.data.reports);
  const [generalErrors, setGeneralErrors] = useState("");
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityModalData, setActivityModalData] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  //get all data from pendingEvents and pendingGallery
  //delete data from pendingEvents or pendingGallery upon approval/rejection

  useEffect(() => {
    dispatch(getReports());
  }, []);

  const handleShowActivityModal = (data) => {
    if (data && data !== "rejectModal") setActivityModalData(data);
    else if (data !== "rejectModal") setActivityModalData({});
    setShowActivityModal(!showActivityModal);
  };

  const handleShowRejectionModal = () => {
    setShowRejectModal(!showRejectModal);
    setGeneralErrors("");
    clearErrors("rejectionReason");
    handleShowActivityModal("rejectModal");
  };

  const handleIgnore = () => {
    //remember to add status
    let data = {
      postID: activityModalData.postID,
    };
    dispatch(ignoreReport(data));
    handleShowActivityModal();
  };

  const handleSuspend = (data) => {
    //handle rejection after rejectionReason is added
    //remember to add status
    let rejectionReason = data["rejectionReason"];

    let rejectionData = {
      postID: activityModalData.postID,
      suspensionReason: rejectionReason,
    };

    dispatch(suspendPost(rejectionData));

    let notification = {
      preText: "",
      postText: "",
      sourceID: "",
      sourceName: "",
      sourceImage: "",
      sourceDestination: "",
      defaultText: "",
      read: false,
      userID: "",
      createdAt: new Date().toISOString(),
      notificationID: "",
    };

    notification.sourceName = activityModalData.clubName;
    notification.sourceID = activityModalData.postID;
    notification.sourceImage = activityModalData.clubImageUrl;
    notification.sourceDestination = "SuspendedPost";
    notification.userID = activityModalData.createdBy;
    notification.preText = "Your post for";
    notification.postText =
      "was reported and is suspended. Tap for more details.";

    let userIDs = [activityModalData.createdBy];
    dispatch(createNotification(notification, userIDs));

    setShowRejectModal(!showRejectModal);
    setGeneralErrors("");
    clearErrors("rejectionReason");
    resetField("rejectionReason");
  };

  //activity modal reflects the type of activity in the modalData

  let ActivityModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showActivityModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={() => handleShowActivityModal()}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-gray-800 pt-1 text-white"
        >
          ✕
        </button>
        <h1 className="text-[24px] text-[#DFE5F8] font-medium mb-[1rem]">
          {activityModalData.clubName}'s post
        </h1>
        {activityModalData.text && (
          <h3 className="text-[18px] text-[#C6CDE2] font-normal">
            {activityModalData.text}
          </h3>
        )}
        {activityModalData.title && (
          <h3 className="text-[22px] text-[#DFE5F8] font-bold">
            {activityModalData.title}
          </h3>
        )}
        {activityModalData.content && (
          <h3 className="text-[18px] text-[#C6CDE2] font-normal">
            {activityModalData.content}
          </h3>
        )}

        {activityModalData.photos && activityModalData.photos.length !== 0 && (
          <Carousel infiniteLoop={true} height="auto">
            {activityModalData.photos.map((image) => {
              return (
                <div>
                  <img src={image} className="h-[300] w-[auto]" />
                </div>
              );
            })}
          </Carousel>
        )}

        {activityModalData.file && (
          <a
            href={activityModalData.file.url}
            target="_blank"
            className="text-[18px] mt-[0.5rem] font-medium text-[#BE5007] text-left clamp-1"
          >
            {activityModalData.file.name}
          </a>
        )}

        {activityModalData.options && (
          <ul className="text-left ml-[24px]">
            {activityModalData.options.map((option) => {
              return (
                <li className="text-[18px] text-[#DFE5F8] font-medium">
                  &#x2022; {option.text}
                </li>
              );
            })}
          </ul>
        )}

        <Button
          onClick={handleIgnore}
          text="ignore"
          className="!mt-[0.625rem]"
          disabled={loading}
          loading={loading}
        />
        <Button
          onClick={handleShowRejectionModal}
          text="suspend"
          x
          className="!mt-[0.625rem] w-full !bg-gray-600 !text-white"
          disabled={loading}
        />
      </div>
    </div>
  );

  let RejectionModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showRejectModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={() => handleShowRejectionModal()}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-gray-800 pt-1 text-white"
        >
          ✕
        </button>
        <h1 className="text-[24px] text-[#DFE5F8] font-medium mb-[1rem]">
          {activityModalData.clubName}'s post
        </h1>
        <div className="flex flex-col space-y-[1rem]">
          <TextInput
            type="text"
            id="rejectionReason"
            placeholder="Enter the reason for suspension here"
            className="w-full !bg-[#232F52]"
            register={register}
            errors={errors}
            disabled={loading}
          />
        </div>
        <Button
          onClick={handleSubmit(handleSuspend)}
          text="suspend"
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
  ) : reports.length > 0 ? (
    <table className=" w-full text-left">
      <thead className="text-xs text-gray-700 uppercase bg-gray-700 text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3 text-white">
            Club
          </th>
          <th scope="col" className="px-6 py-3 text-white">
            Post type
          </th>
          <th scope="col" className="px-6 py-3 text-white">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report, index) => {
          return (
            <tr
              className="text-[16px] border-b bg-gray-800 border-gray-700 hover:bg-gray-600"
              key={index}
            >
              <th
                scope="row"
                className="px-6 py-4 font-bold text-[#DFE5F8] whitespace-nowrap"
              >
                {report.clubName}
              </th>
              <th
                scope="row"
                className="px-6 py-4 font-bold text-[#DFE5F8] whitespace-nowrap"
              >
                {report.type}
              </th>
              <td className="px-6 py-4 text-right">
                <button
                  className="cursor-pointer font-medium text-[#C4FFF9] text-[#C4FFF9] hover:underline"
                  onClick={() => handleShowActivityModal(report)}
                >
                  Show Details
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <p className="text-center">No reports found</p>
  );

  return (
    <div className="top-[26px] w-full items-center relative overflow-x-auto shadow-md sm:rounded-lg">
      {display}
      {ActivityModal}
      {RejectionModal}
    </div>
  );
}
