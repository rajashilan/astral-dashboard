import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import OrientationOverview from "../components/OrientationOverview";
import OrientationSubcontent from "../components/OrientationSubcontent";

import { useSelector } from "react-redux";

export default function Orientation() {
  const state = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.authenticated) navigate("/login");
  }, []);

  return (
    <main className="absolute top-0 overflow-auto py-[100px] scrollbar-hide flex h-full w-full justify-center items-center bg-[#0C111F]">
      <div className="mt-[180px] flex flex-col items-center bg-[#131A2E] px-[140px] py-[60px] max-w-[80%] rounded-lg">
        <h1 className="text-[24px] text-[#DFE5F8] font-medium">
          Orientation title
        </h1>
        <OrientationOverview />
        <hr className="border border-solid border-gray-500 border-[1px] w-full my-[2rem]" />
        <h1 className="text-[24px] text-[#DFE5F8] font-medium">Pages</h1>
        <OrientationSubcontent />
      </div>
      <div className="h-[80px] bg-[#0C111F] flex-col"></div>
    </main>
  );
}
