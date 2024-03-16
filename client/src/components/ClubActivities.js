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
  setClubEventToTrue,
  setClubGalleryToTrue,
} from "../redux/actions/dataActions";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import axios from "axios";

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
  const [generalErrors, setGeneralErrors] = useState("");
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityModalData, setActivityModalData] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  //get all data from pendingEvents and pendingGallery
  //delete data from pendingEvents or pendingGallery upon approval/rejection

  useEffect(() => {
    dispatch(getClubActivities());
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

  const handleReject = (data) => {
    //handle rejection after rejectionReason is added
    //remember to add status
    let rejectionReason = data["rejectionReason"];

    let rejectionData = {
      status: "rejected",
      rejectionReason,
    };

    const campusID = localStorage.getItem("AdminCampus");

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

    axios
      .post(`/clubs/${activityModalData.clubID}/${campusID}`)
      .then((res) => {
        return res.data;
      })
      .then((club) => {
        notification.sourceName = club.name;
        notification.sourceID = club.clubID;
        notification.sourceImage = club.image;
        notification.sourceDestination = "ClubsPages";
        notification.userID = club.roles["president"].userID;
        notification.postText = "rejected. Visit your club's page for details.";

        if (activityModalData.activity === "Event") {
          dispatch(handleEventActivity(activityModalData, rejectionData));
          //notification
          notification.preText = "Event request for";

          //Event request for Computer Science Club rejected. Visit your club's page for details.
        } else if (activityModalData.activity === "Gallery") {
          //notification
          dispatch(handleGalleryActivity(activityModalData, rejectionData));
          notification.preText = "Gallery request for";
        }

        let userIDs = [club.roles["president"].userID];
        dispatch(createNotification(notification, userIDs));
      })
      .catch((error) => {
        console.error(error);
      });

    setShowRejectModal(!showRejectModal);
    setGeneralErrors("");
    clearErrors("rejectionReason");
    resetField("rejectionReason");
  };

  const handleApprove = () => {
    //remember to add status
    let approvalData = {
      status: "approved",
    };

    const campusID = localStorage.getItem("AdminCampus");

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

    axios
      .post(`/clubs/${activityModalData.clubID}/${campusID}`)
      .then((res) => {
        return res.data;
      })
      .then((club) => {
        notification.sourceName = club.name;
        notification.sourceID = club.clubID;
        notification.sourceImage = club.image;
        notification.sourceDestination = "ClubsPages";
        notification.userID = club.roles["president"].userID;
        notification.postText = "has been approved.";

        if (activityModalData.activity === "Event") {
          dispatch(handleEventActivity(activityModalData, approvalData));

          notification.preText = "Event request for";

          if (activityModalData.hasEvents === false) {
            dispatch(setClubEventToTrue(activityModalData.clubID));
          }
        } else if (activityModalData.activity === "Gallery") {
          dispatch(handleGalleryActivity(activityModalData, approvalData));

          notification.preText = "Gallery request for";

          if (activityModalData.hasGallery === false) {
            dispatch(setClubGalleryToTrue(activityModalData.clubID));
          }
        }

        let userIDs = [club.roles["president"].userID];
        dispatch(createNotification(notification, userIDs));
      })
      .catch((error) => {
        console.error(error);
      });

    handleShowActivityModal();
  };

  //activity modal reflects the type of activity in the modalData

  let ActivityModal =
    activityModalData.activity === "Gallery" ? (
      <div
        className={
          "modal modal-middle h-auto " + (showActivityModal ? "modal-open" : "")
        }
      >
        <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
          <button
            onClick={() => handleShowActivityModal()}
            className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
          >
            ✕
          </button>
          <h1 className="text-[24px] text-[#DFE5F8] font-medium mb-[1rem]">
            {activityModalData.clubName}'s {activityModalData.activity}
          </h1>
          <img src={activityModalData.image} />
          {activityModalData.title && (
            <h3 className="text-[18px] text-[#DFE5F8] font-medium">
              {activityModalData.title}
            </h3>
          )}
          {activityModalData.content && (
            <p className="text-[16px] text-[#C6CDE2] font-normal">
              {activityModalData.content}
            </p>
          )}
          <Button
            onClick={handleApprove}
            text="approve"
            className="!mt-[0.625rem]"
            disabled={loading}
            loading={loading}
          />
          <Button
            onClick={handleShowRejectionModal}
            text="reject"
            x
            className="!mt-[0.625rem] w-full !bg-gray-600 !text-white"
            disabled={loading}
          />
        </div>
      </div>
    ) : activityModalData.activity === "Event" ? (
      <div
        className={
          "modal modal-middle h-auto " + (showActivityModal ? "modal-open" : "")
        }
      >
        <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
          <button
            onClick={() => handleShowActivityModal()}
            className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
          >
            ✕
          </button>
          <h1 className="text-[24px] text-[#DFE5F8] font-medium mb-[1rem]">
            {activityModalData.clubName}'s {activityModalData.activity}
          </h1>
          {activityModalData.image && <img src={activityModalData.image} />}
          {activityModalData.title && (
            <h3 className="text-[18px] text-[#DFE5F8] font-medium">
              {activityModalData.title}
            </h3>
          )}
          {activityModalData.content && (
            <p className="text-[16px] text-[#C6CDE2] font-normal">
              {activityModalData.content}
            </p>
          )}
          <Button
            onClick={handleApprove}
            text="approve"
            className="!mt-[0.625rem]"
            disabled={loading}
            loading={loading}
          />
          <Button
            onClick={handleShowRejectionModal}
            text="reject"
            x
            className="!mt-[0.625rem] w-full !bg-gray-600 !text-white"
            disabled={loading}
          />
        </div>
      </div>
    ) : null;

  let RejectionModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showRejectModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={() => handleShowRejectionModal()}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <h1 className="text-[24px] text-[#DFE5F8] font-medium mb-[1rem]">
          {activityModalData.clubName}'s {activityModalData.activity}
        </h1>
        <div className="flex flex-col space-y-[1rem]">
          <TextInput
            type="text"
            id="rejectionReason"
            placeholder="Enter the reason for rejection here"
            className="w-full !bg-[#232F52]"
            register={register}
            errors={errors}
            disabled={loading}
          />
        </div>
        <Button
          onClick={handleSubmit(handleReject)}
          text="reject"
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
  ) : clubActivities.length > 0 ? (
    <table className=" w-full text-left">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 bg-gray-700 text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Club
          </th>
          <th scope="col" className="px-6 py-3">
            <span className="sr-only">Activity</span>
          </th>
          <th scope="col" className="px-6 py-3">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {clubActivities.map((activity, index) => {
          return (
            <tr
              className="text-[16px] bg-white border-b bg-gray-800 border-gray-700 hover:bg-gray-50 hover:bg-gray-600"
              key={index}
            >
              <th
                scope="row"
                className="px-6 py-4 font-bold text-[#DFE5F8] whitespace-nowrap"
              >
                {activity.clubName}
              </th>
              <th
                scope="row"
                className="px-6 py-4 font-bold text-[#DFE5F8] whitespace-nowrap"
              >
                {activity.activity}
              </th>
              <td className="px-6 py-4 text-right">
                <button
                  className="cursor-pointer font-medium text-[#C4FFF9] text-[#C4FFF9] hover:underline"
                  onClick={() => handleShowActivityModal(activity)}
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
    <p className="text-center">No pending club activities found</p>
  );

  return (
    <div className="top-[26px] w-full items-center relative overflow-x-auto shadow-md sm:rounded-lg">
      {display}
      {ActivityModal}
      {RejectionModal}
    </div>
  );
}
