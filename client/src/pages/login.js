import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";

import TextInput from "../components/TextInput";
import Button from "../components/Button";
import ErrorLabel from "../components/ErrorLabel";
import SuccessLabel from "../components/SuccessLabel";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { loginAdmin } from "../redux/actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import { CLEAR_GENERAL_ERRORS } from "../redux/types";

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

  const [generalErrors, setGeneralErrors] = useState("");

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((state) => state.user);
  const loading = useSelector((state) => state.UI.loading);

  useEffect(() => {
    if (state.authenticated) navigate("/menu");
  }, []);

  const onFormSubmit = (data) => {
    dispatch({ type: CLEAR_GENERAL_ERRORS });
    let loginData = {
      email: data["email"],
      password: data["password"],
    };

    dispatch(loginAdmin(loginData, navigate));
  };

  let signedUp = false;

  if (location.state !== null) signedUp = location.state.signedUp;

  return (
    <main className="absolute top-0 flex h-screen w-full flex-col pt-[100px] items-center bg-[#0C111F]">
      <img
        src={logo}
        alt="astral"
        className="h-[98px] w-[184px] object-contain mb-[48px]"
      />
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
          loading={loading}
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
