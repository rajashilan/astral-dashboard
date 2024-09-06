import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";

//pages
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/home";
import Menu from "./pages/menu";
import College from "./pages/college";
import Orientation from "./pages/orientation";
import Clubs from "./pages/clubs";

//components
import Navbar from "./components/Navbar";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "./redux/actions/userActions";

axios.defaults.baseURL =
  "https://asia-southeast1-astral-d3ff5.cloudfunctions.net/api";

// axios.defaults.baseURL =
//   "http://localhost:5000/astral-d3ff5/asia-southeast1/api";

function App() {
  const error = useSelector((state) => state.UI.error);
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      toast(error, {
        position: "top-center",
        progressClassName: "color-[#C4FFF9]",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      if (
        error.toLowerCase() === "unauthorized" ||
        error.toLowerCase() === "invalid admin"
      ) {
        window.location.href = "/";
      }
    }
  }, [error]);

  return (
    <Router>
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/:campusID/:linkID/:admin" element={<Signup />} />
        <Route exact path="/" element={<Menu />} />
        <Route exact path="/home" element={<Home />} />
        <Route exact path="/admin" element={<College />} />
        <Route exact path="/orientation" element={<Orientation />} />
        <Route exact path="/clubs" element={<Clubs />} />
      </Routes>
    </Router>
  );
}
{
  /* <div className="mt-[4rem] mx-[8rem]  px-[3.75rem] py-[3.75rem] flex rounded-lg bg-[#131A2E]"></div> */
}

export default App;
