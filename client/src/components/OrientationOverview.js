import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import ReactPlayer from "react-player";

import TextInput from "../components/TextInput";
import Button from "../components/Button";
import Label from "../components/Label";

import edit from "../assets/edit.svg";
import bin from "../assets/bin.svg";
import video from "../assets/video.svg";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  addOrientationOverviewVideo,
  deleteOrientationOverviewVideo,
  getOrientationOverview,
  updateOrientationOverviewTitle,
} from "../redux/actions/dataActions";
import { LOADING_DATA, STOP_LOADING_DATA } from "../redux/types";

const formSchema = z.object({
  title: z.string().min(1, { message: "Please enter a Heading" }),
});

export default function OrientationOverview() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const dispatch = useDispatch();
  const state = useSelector((state) => state.data.orientation.overview);
  const loading = useSelector((state) => state.data.loading);

  const [showDeleteVideoModal, setShowDeleteVideoModal] = useState(false);
  const [deleteVideoID, setDeleteVideoID] = useState("");

  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [addVideo, setAddVideo] = useState("");
  const [filename, setFilename] = useState("");

  useEffect(() => {
    dispatch(getOrientationOverview());
  }, []);

  const onFormSubmit = (data) => {
    let titleData = {
      title: data["title"],
    };

    dispatch(updateOrientationOverviewTitle(titleData, state.orientationID));
  };

  //for adding video, instead of choosing a file,
  //show an input asking user to copy paste their google drive video url
  //not ideal, but this is the best case scenario for video uploads for now

  const handleAddVideo = () => {
    //show a modal to get the url
    //replace everything after the last slash with preview
    //get the filename?
    let data = {
      filename: filename,
      url: addVideo,
    };

    data.url = data.url.replace(/[^/]*$/, "preview");
    console.log(data);
    dispatch(addOrientationOverviewVideo(data, state.orientationID));
    handleAddVideoModal();
  };

  const handleAddVideoModal = () => {
    setShowAddVideoModal(!showAddVideoModal);
    setAddVideo("");
    setFilename("");
  };

  let AddVideoModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showAddVideoModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={handleAddVideoModal}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <Label className="!text-center">
          Adding videos
          <br />
          To add videos, first upload your video to Google Drive.
          <br />
          Ensure the sharing settings is enabled for everyone who has the link.
          <br />
          Then, copy and paste the sharing link here.
        </Label>
        <TextInput
          type="text"
          id="videoUrl"
          className="w-full !mt-[24px] !bg-[#232F52]"
          placeholder="Enter your Google Drive video link here"
          disabled={loading}
          onChange={(e) => setAddVideo(e.target.value)}
          value={addVideo}
        />
        <TextInput
          type="text"
          id="videoFilename"
          className="w-full !bg-[#232F52]"
          placeholder="Enter your video title"
          disabled={loading}
          onChange={(e) => setFilename(e.target.value)}
          value={filename}
        />
        {addVideo !== "" && filename !== "" ? (
          <Button
            onClick={handleAddVideo}
            text="add video"
            x
            className="w-full"
            disabled={loading}
          />
        ) : null}
      </div>
    </div>
  );

  //first show delete video modal
  //set the delete video data in state
  //if confirm, dispatch
  const handleDeleteVideoModal = (videoID) => {
    if (videoID !== "") {
      setDeleteVideoID(videoID);
      setShowDeleteVideoModal(!showDeleteVideoModal);
    } else {
      setDeleteVideoID("");
      setShowDeleteVideoModal(!showDeleteVideoModal);
    }
  };

  const handleDeleteVideo = () => {
    let data = {
      videoID: deleteVideoID,
    };
    dispatch(deleteOrientationOverviewVideo(data, state.orientationID));
    handleDeleteVideoModal();
  };

  let confirmDeleteVideoModal = (
    <div
      className={
        "modal modal-middle h-auto " +
        (showDeleteVideoModal ? "modal-open" : "")
      }
    >
      <div className=" modal-box flex flex-col text-center gap-2 bg-[#1A2238] p-10">
        <button
          onClick={handleDeleteVideoModal}
          className="btn-sm btn-circle btn absolute right-4 top-4 bg-base-100 pt-1 text-white"
        >
          ✕
        </button>
        <p className="text-[18px] text-[#DFE5F8] font-normal mt-[1rem] mb=[1rem]">
          Are you sure you want to delete the following video?
        </p>
        <ReactPlayer
          controls={true}
          width="auto"
          height="320px"
          playIcon
          url={deleteVideoID}
        />
        <Button
          onClick={handleDeleteVideo}
          text="delete"
          x
          className="w-full !bg-gray-600 !text-white"
          disabled={loading}
        />
        <Button
          onClick={handleDeleteVideoModal}
          text="cancel"
          x
          className="w-full"
          disabled={loading}
        />
      </div>
    </div>
  );

  //if 1 video, only show that video
  //if more than 1 video, show a a grid of 2
  let videos = state.videos ? (
    state.videos.length === 1 ? (
      <div className="flex items-center justify-center  mt-[2rem]">
        <div className="grid grid-flow-row-dense grid-cols-2 gap-[2rem]">
          <div className="flex flex-row">
            {/* <ReactPlayer
            controls={true}
            width="auto"
            height="auto"
            playIcon
            url={state.videos[0].url}
          /> */}
            <iframe src={state.videos[0].url} width="auto" height="auto" />
            <div className="flex flex-col ml-[0.5rem] space-y-[0.5rem]">
              <button
                onClick={() => {
                  handleDeleteVideoModal(state.videos[0].videoID);
                }}
                className="btn-sm btn-square btn p-1 bg-red-700"
              >
                <img src={bin} alt="delete" />
              </button>
            </div>
          </div>
          <Button
            onClick={handleAddVideoModal}
            img={video}
            className="!w-full !h-full !max-w-[320px]"
            imgClassName="!w-[56px] !h-[42px]"
            disabled={loading}
          />
        </div>
      </div>
    ) : state.videos.length > 1 ? (
      <div className="grid grid-flow-row-dense grid-cols-3 gap-[2rem] mt-[2rem] items-center justify-center">
        {state.videos &&
          state.videos.map((video) => {
            return (
              <div className="flex flexrow">
                <iframe src={video.url} width="auto" height="auto" />
                <div className="fle-x flex-col ml-[0.5rem] space-y-[0.5rem]">
                  <button
                    onClick={() => {
                      handleDeleteVideoModal(video.videoID);
                    }}
                    className="btn-sm btn-square btn p-1 bg-red-700"
                  >
                    <img src={bin} alt="delete" />
                  </button>
                </div>
              </div>
            );
          })}
        {/* only show video button if there is less than 3 videos */}
        {state.videos && state.videos.length < 3 ? (
          <>
            <Button
              onClick={handleAddVideoModal}
              img={video}
              className="!w-full !h-full"
              imgClassName="!w-[56px] !h-[42px] !max-w-[320px]"
              disabled={loading}
            />
          </>
        ) : null}
      </div>
    ) : (
      <div className="flex justify-center mt-[2rem]">
        <Button
          onClick={handleAddVideoModal}
          img={video}
          className="!w-auto !h-auto !px-[100px] justify-self-center"
          imgClassName="!w-[56px] !h-[42px] !max-w-[320px]"
          disabled={loading}
        />
      </div>
    )
  ) : null;

  //show video disclaimer if more than 3 videos
  let videoCapText =
    state.videos && state.videos.length === 3 ? (
      <Label className="!text-[#C6CDE2] !text-center !mt-[2rem]">
        Max video cap reached. Please delete a video to add a new one.
      </Label>
    ) : null;

  return (
    <div className="mt-[26px] items-center">
      <form
        className="w-full flex flex-col items-center"
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <div className="flex flex-row space-x-[1rem]">
          <div className="flex flex-col items-center">
            <TextInput
              type="text"
              id="title"
              className="!w-[400px]"
              placeholder={state.title ? state.title : "Enter your title here"}
              register={register}
              errors={errors}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleSubmit(onFormSubmit)}
            img={edit}
            className="!w-[72px] !h-[60px]"
            disabled={loading}
          />
        </div>
      </form>
      {videos}
      {videoCapText}
      {AddVideoModal}
      {confirmDeleteVideoModal}
    </div>
  );
}
