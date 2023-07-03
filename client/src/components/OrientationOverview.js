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
  const [deleteVideoUrl, setDeleteVideoUrl] = useState("");
  const [addVideo, setAddVideo] = useState(null);

  useEffect(() => {
    dispatch(getOrientationOverview());
  }, []);

  const onFormSubmit = (data) => {
    let titleData = {
      title: data["title"],
    };

    dispatch(updateOrientationOverviewTitle(titleData, state.orientationID));
  };

  const handleAddVideo = () => {
    const fileInput = document.getElementById("videoInput");
    fileInput.click();
  };

  const handleVideoChange = (event) => {
    const video = event.target.files[0];
    setAddVideo(video);
  };

  useEffect(() => {
    if (addVideo) {
      const campusID = localStorage.getItem("AdminCampus");

      const formData = new FormData();
      formData.append("video", addVideo, addVideo.name);

      dispatch({ type: LOADING_DATA });
      axios
        .post(`/overview-video/${campusID}`, formData)
        .then((res) => {
          let data = {
            filename: res.data.filename,
            url: res.data.downloadUrl,
          };
          return data;
        })
        .then((data) => {
          dispatch(addOrientationOverviewVideo(data, state.orientationID));
        })
        .catch((error) => {
          console.error(error);
          dispatch({ type: STOP_LOADING_DATA });
        });
      setAddVideo(null);
    }
  }, [addVideo]);

  //first show delete video modal
  //set the delete video data in state
  //if confirm, dispatch
  const handleDeleteVideoModal = (url) => {
    if (url !== "") {
      setDeleteVideoUrl(url);
      setShowDeleteVideoModal(!showDeleteVideoModal);
    } else {
      setDeleteVideoUrl("");
      setShowDeleteVideoModal(!showDeleteVideoModal);
    }
  };

  const handleDeleteVideo = () => {
    let data = {
      url: deleteVideoUrl,
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
          url={deleteVideoUrl}
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
      <div className="grid grid-flow-row-dense grid-cols-2 gap-[2rem] mt-[2rem] items-center justify-center">
        <div className="flex flex-row">
          <ReactPlayer
            controls={true}
            width="auto"
            height="auto"
            playIcon
            url={state.videos[0].url}
          />
          <div className="flex flex-col ml-[0.5rem] space-y-[0.5rem]">
            <button
              onClick={() => {
                handleDeleteVideoModal(state.videos[0].url);
              }}
              className="btn-sm btn-square btn p-1 bg-red-700"
            >
              <img src={bin} alt="delete" />
            </button>
          </div>
        </div>
        <Button
          onClick={handleAddVideo}
          img={video}
          className="!w-full !h-full"
          imgClassName="!w-[56px] !h-[42px]"
          disabled={loading}
        />
        <input
          type="file"
          id="videoInput"
          accept="video/mp4"
          onChange={handleVideoChange}
          hidden="hidden"
        />
      </div>
    ) : state.videos.length > 1 ? (
      <div className="grid grid-flow-row-dense grid-cols-3 gap-[2rem] mt-[2rem] items-center justify-center">
        {state.videos &&
          state.videos.map((video) => {
            return (
              <div className="flex flexrow">
                <ReactPlayer
                  controls={true}
                  width="auto"
                  height="auto"
                  playIcon
                  url={video.url}
                />
                <div className="fle-x flex-col ml-[0.5rem] space-y-[0.5rem]">
                  <button
                    onClick={() => {
                      handleDeleteVideoModal(video.url);
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
              onClick={handleAddVideo}
              img={video}
              className="!w-full !h-full"
              imgClassName="!w-[56px] !h-[42px]"
              disabled={loading}
            />
            <input
              type="file"
              id="videoInput"
              accept="video/mp4"
              onChange={handleVideoChange}
              hidden="hidden"
            />
          </>
        ) : null}
      </div>
    ) : (
      <div className="flex justify-center mt-[2rem]">
        <Button
          onClick={handleAddVideo}
          img={video}
          className="!w-auto !h-auto !px-[100px] justify-self-center"
          imgClassName="!w-[56px] !h-[42px]"
          disabled={loading}
        />
        <input
          type="file"
          id="videoInput"
          accept="video/mp4"
          onChange={handleVideoChange}
          hidden="hidden"
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
      {confirmDeleteVideoModal}
    </div>
  );
}
