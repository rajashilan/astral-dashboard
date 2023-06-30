import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import ReactPlayer from "react-player";

import TextInput from "../components/TextInput";
import Button from "../components/Button";
import ErrorLabel from "../components/ErrorLabel";

import edit from "../assets/edit.svg";
import bin from "../assets/bin.svg";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  getOrientationOverview,
  updateOrientationOverviewTitle,
} from "../redux/actions/dataActions";

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

  useEffect(() => {
    dispatch(getOrientationOverview());
  }, []);

  const onFormSubmit = (data) => {
    let titleData = {
      title: data["title"],
    };

    dispatch(updateOrientationOverviewTitle(titleData, state.orientationID));
  };

  //if 1 video, only show that video
  //if more than 1 video, show a a grid of 2
  let videos = state.videos ? (
    state.videos.length === 1 ? (
      <div className="flex mt-[2rem] items-center justify-center">
        <div className="flex flex-row">
          <ReactPlayer
            controls={true}
            width="auto"
            height="360px"
            playIcon
            url={state.videos[0].url}
          />
          <div className="flex flex-col ml-[0.5rem] space-y-[0.5rem]">
            <button
              onClick={() => {}}
              className="btn-sm btn-square btn p-1 bg-[#07BEB8]"
            >
              <img src={edit} alt="edit" />
            </button>
            <button
              onClick={() => {}}
              className="btn-sm btn-square btn p-1 bg-red-700"
            >
              <img src={bin} alt="delete" />
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="grid grid-flow-row-dense grid-cols-3 gap-[2rem] mt-[2rem] items-center justify-center">
        {state.videos.map((video) => {
          return (
            <div className="flex flex-row">
              <ReactPlayer
                controls={true}
                width="auto"
                height="auto"
                playIcon
                url={video.url}
              />
              <div className="flex flex-col ml-[0.5rem] space-y-[0.5rem]">
                <button
                  onClick={() => {}}
                  className="btn-sm btn-square btn p-1 bg-[#07BEB8]"
                >
                  <img src={edit} alt="edit" />
                </button>
                <button
                  onClick={() => {}}
                  className="btn-sm btn-square btn p-1 bg-red-700"
                >
                  <img src={bin} alt="delete" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )
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
    </div>
  );
}
