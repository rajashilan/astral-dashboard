import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate, useParams } from "react-router-dom";

import TextInput from "../components/TextInput";
import Button from "../components/Button";
import LabelButton from "../components/LabelButton";
import ErrorLabel from "../components/ErrorLabel";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { CLEAR_GENERAL_ERRORS, SET_GENERAL_ERRORS } from "../redux/types";
import { setupAuth, setupAxiosInterceptors } from "..";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Please enter a valid email" })
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Please enter a valid email",
    }),
  name: z.string().min(1, { message: "Please enter your name" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .refine(
      (value) =>
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(value),
      {
        message:
          "Password must contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character",
      }
    ),
});

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const navigate = useNavigate();
  const state = useSelector((state) => state.user);
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [generalErrors, setGeneralErrors] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    if (generalErrors)
      dispatch({
        type: SET_GENERAL_ERRORS,
        payload: generalErrors,
      });
  }, [generalErrors]);

  useEffect(() => {
    if (state.authenticated) navigate("/menu");
    //check if link and campus ID are valid

    //check if its added admin
    //1 for first time, 2 for added
    setDisable(true);
    let requestLink;
    dispatch({ type: CLEAR_GENERAL_ERRORS });

    if (params.admin === "1")
      requestLink = `/validate-link/${params.campusID}/${params.linkID}`;
    else if (params.admin === "2")
      requestLink = `/validate-add-admin-link/${params.campusID}/${params.linkID}`;
    else {
      requestLink = undefined;
      setGeneralErrors("Invalid link");
    }

    if (requestLink) {
      setGeneralErrors("");
      setLoading(true);

      const verifyLink = async () => {
        await setupAxiosInterceptors();
        setupAuth();

        axios
          .post(requestLink)
          .then((res) => {
            setLoading(false);
            const valid = res.data.valid;
            if (valid === true) {
              setDisable(false);
            } else {
              setGeneralErrors("Invalid link");
            }
          })
          .catch((error) => {
            console.log(error.response.status);
            if (error.response.status === 404) setGeneralErrors("Invalid link");
            else setGeneralErrors(error.response.data.error);
            console.error(error);
            setLoading(false);
          });
      };

      verifyLink();
    }
  }, []);

  const onFormSubmit = (data) => {
    setDisable(true);
    let signupLink;

    if (params.admin === "1")
      signupLink = `/admin-signup/${params.campusID}/${params.linkID}`;
    else if (params.admin === "2")
      signupLink = `/add-admin-signup/${params.campusID}/${params.linkID}`;

    setGeneralErrors("");
    dispatch({ type: CLEAR_GENERAL_ERRORS });
    setLoading(true);

    let signupData = {
      name: data["name"],
      email: data["email"],
      password: data["password"],
    };

    if (signupLink) {
      axios
        .post(signupLink, signupData)
        .then((res) => {
          console.log(res.data);
          setLoading(false);
          setDisable(false);
          navigate("/", {
            state: {
              signedUp: true,
            },
          });
        })
        .catch((error) => {
          setGeneralErrors(error.response.data.error);
          console.error(error);
          setLoading(false);
          setDisable(false);
        });
    }
  };

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
          disabled={disable}
        />
        <TextInput
          type="text"
          id="name"
          placeholder="Name"
          register={register}
          errors={errors}
          disabled={disable}
        />
        <TextInput
          type="password"
          id="password"
          placeholder="Password"
          register={register}
          errors={errors}
          disabled={disable}
        />
        <Button
          onClick={handleSubmit(onFormSubmit)}
          text="signup"
          className="!mt-[26px]"
          disabled={disable}
          loading={loading}
        />
        {!loading && (
          <Link to="/">
            <LabelButton text="login instead" className="!mt-[60px]" />
          </Link>
        )}
      </form>
    </main>
  );
}
