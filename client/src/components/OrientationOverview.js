import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import TextInput from "../components/TextInput";
import Button from "../components/Button";
import ErrorLabel from "../components/ErrorLabel";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

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

  const [orientation, setOrientation] = useState({});

  const dispatch = useDispatch();
  const state = useSelector((state) => state.data);
  const loading = useSelector((state) => state.data.loading);

  const campusID = localStorage.getItem("AdminCampus");

  useEffect(() => {
    axios
      .get(`/orientation/${campusID}`)
      .then((res) => {
        setOrientation(res.data);
      })
      .catch((error) => console.error(error));
  }, []);

  const onFormSubmit = (data) => {
    let titleData = {
      title: data["title"],
    };

    axios
      .post(
        `/orientation/${orientation.campusID}/${orientation.orientationID}`,
        titleData
      )
      .then((res) => {
        let temp = orientation;
        temp.title = titleData.title;
        setOrientation(temp);
        alert("Orientation title updated successfully");
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="mt-[26px] w-full items-center overflow-hidden shadow-md sm:rounded-lg">
      <form
        className="w-full space-y-[20px] flex flex-col items-center"
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <TextInput
          type="text"
          id="title"
          placeholder={
            orientation.title ? orientation.title : "Enter your title here"
          }
          register={register}
          errors={errors}
          disabled={loading}
        />

        <Button
          onClick={handleSubmit(onFormSubmit)}
          text="update"
          className="!mt-[26px]"
          disabled={loading}
        />
      </form>
    </div>
  );
}
