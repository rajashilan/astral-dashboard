import React, { useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import { useNavigate, useLocation } from "react-router-dom";

import TextInput from "../components/TextInput";
import Button from "../components/Button";
import LabelButton from "../components/LabelButton";
import ErrorLabel from "../components/ErrorLabel";
import SuccessLabel from "../components/SuccessLabel";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import axios from "axios";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Please enter your password" }),
});

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [generalErrors, setGeneralErrors] = useState("");

  const onFormSubmit = (data) => {
    setGeneralErrors("");
    setLoading(true);

    let loginData = {
      email: data["email"],
      password: data["password"],
    };

    axios
      .post("/login", loginData)
      .then((res) => {
        localStorage.setItem("FBIdToken", `Bearer ${res.data.token}`);
        localStorage.setItem("AdminCampus", res.data.campusID);
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        setGeneralErrors(error.response.data.error);
        console.error(error);
        setLoading(false);
      });
  };

  let signedUp = false;

  if (location.state !== null) signedUp = location.state.signedUp;

  return (
    <main className="absolute top-0 flex h-screen w-full flex-col pt-[100px] items-center bg-[#0C111F]">
      <img src={logo} alt="astral" className="h-[98px] w-[184px] mb-[48px]" />
      <form
        className="w-[40%] space-y-[20px] flex flex-col items-center"
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <TextInput
          type="text"
          id="email"
          placeholder="Email"
          register={register}
          errors={errors}
          disabled={loading}
        />
        <TextInput
          type="password"
          id="password"
          placeholder="Password"
          register={register}
          errors={errors}
          disabled={loading}
        />
        <Button
          onClick={handleSubmit(onFormSubmit)}
          text="login"
          className="!mt-[26px]"
          disabled={loading}
        />

        {signedUp && (
          <SuccessLabel className="!mt-[16px] !text-center">
            You have been registered successfully! We have sent you a
            verification email. Please click on the link to complete your
            registration.
          </SuccessLabel>
        )}
        <ErrorLabel className="!mt-[16px]">{generalErrors}</ErrorLabel>
      </form>
    </main>
  );
}
