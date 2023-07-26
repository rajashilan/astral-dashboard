import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import Button from "./Button";
import ErrorLabel from "./ErrorLabel";
import TextInput from "../components/TextInput";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { approveClub, rejectClub } from "../redux/actions/dataActions";

const formSchema = z.object({
  rejectionReason: z
    .string()
    .min(1, { message: "Please enter a reason for rejecting the request." }),
});

export default function PendingClubs() {
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const dispatch = useDispatch();
  const state = useSelector((state) => state.data);
  const loading = useSelector((state) => state.data.loading);

  const [generalErrors, setGeneralErrors] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionModalData, setRejectionModalData] = useState({});

  const [pendingClubs, setPendingClubs] = useState([]);

  useEffect(() => {
    setPendingClubs(state.clubs.filter((club) => club.approval === "pending"));
  }, [state.clubs]);

  const handleApprove = (club) => {
    dispatch(approveClub(club));
  };

  const handleShowRejectionModal = (data) => {
    if (data) setRejectionModalData(data);
    else setShowRejectionModal({});
    clearErrors("rejectionReason");
    setShowRejectionModal(!showRejectionModal);
  };

  const handleReject = (data) => {
    let rejectionReason = data["rejectionReason"];
    dispatch(rejectClub(rejectionModalData, rejectionReason));
    handleShowRejectionModal();
  };

  let RejectModal = (
    <div
      className={
        "modal modal-middle h-auto " + (showRejectionModal ? "modal-open" : "")
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
          Reject Club Request
        </h1>
        <h3 className="text-[18px] text-[#DFE5F8] font-medium mb-[1rem]">
          {rejectionModalData.name}
        </h3>
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
        />
      </div>
    </div>
  );

  let display = state.loading ? (
    <p>Loading clubs...</p>
  ) : pendingClubs.length > 0 ? (
    <table className=" w-full text-left">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Name
          </th>
          <th scope="col" className="px-6 py-3">
            <span className="sr-only">Approve</span>
          </th>
          <th scope="col" className="px-6 py-3">
            <span className="sr-only">Reject</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {pendingClubs.map((club, index) => {
          return (
            <tr
              className="text-[16px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              key={index}
            >
              <th
                scope="row"
                className="px-6 py-4 font-bold text-[#DFE5F8] whitespace-nowrap"
              >
                {club.name}
              </th>
              <td className="px-6 py-4 text-right">
                <button
                  className="cursor-pointer font-medium text-[#C4FFF9] dark:text-[#C4FFF9] hover:underline"
                  onClick={() => handleApprove(club)}
                >
                  Approve
                </button>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  className="cursor-pointer font-medium text-[#C4FFF9] dark:text-[#C4FFF9] hover:underline"
                  onClick={() => handleShowRejectionModal(club)}
                >
                  Reject
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <p className="text-center">No clubs found</p>
  );

  return (
    <div className="top-[26px] w-full items-center relative overflow-x-auto shadow-md sm:rounded-lg">
      {display}
      {RejectModal}
    </div>
  );
}
