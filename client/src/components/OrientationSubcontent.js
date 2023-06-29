import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getOrientationPages } from "../redux/actions/dataActions";

import OrientationPagePreview from "./OrientationPagePreview";

export default function OrientationSubcontent() {
  //first get all the list of subcontents
  //display each page as a link

  //on click- -> show modal containing all data for the page
  //admin can edit in the modal

  const state = useSelector((state) => state.data);
  const orientation = useSelector((state) => state.data.orientation.overview);
  const loading = useSelector((state) => state.data.loading);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOrientationPages());
  }, []);

  return (
    <div className="mt-[26px] w-full items-center  space-y-[1rem]">
      <OrientationPagePreview />
    </div>
  );
}
