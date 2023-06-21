import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import TextInput from "../components/TextInput";
import Button from "../components/Button";
import ErrorLabel from "../components/ErrorLabel";

import edit from "../assets/edit.svg";

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
  const state = useSelector((state) => state.data);
  const orientation = useSelector((state) => state.data.orientation.overview);
  const loading = useSelector((state) => state.data.loading);

  useEffect(() => {
    dispatch(getOrientationOverview());
  }, []);

  const onFormSubmit = (data) => {
    let titleData = {
      title: data["title"],
    };

    dispatch(
      updateOrientationOverviewTitle(titleData, orientation.orientationID)
    );
  };

  return (
    <div className="mt-[26px] items-center overflow-hidden shadow-md sm:rounded-lg">
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
              placeholder={
                orientation.title ? orientation.title : "Enter your title here"
              }
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
    </div>
  );
}
