import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function department() {
  const navigate = useNavigate();
  const location = useLocation();

  let departmentID;
  if (location.state !== null) departmentID = location.state.departmentID;
  console.log(departmentID);

  return <div>department</div>;
}
