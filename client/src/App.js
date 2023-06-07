import React, { Component, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode";

//redux
import { Provider, useDispatch, useSelector } from "react-redux";
import { logoutUser, getSessionData } from "./redux/actions/userActions";
import { SET_AUTHENTICATED } from "./redux/types";
import store from "./redux/store";

//pages
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/home";
import Menu from "./pages/menu";
import College from "./pages/college";

//components
import Navbar from "./components/Navbar";

// axios.defaults.baseURL =
//   "https://asia-southeast1-astral-d3ff5.cloudfunctions.net/api";

axios.defaults.baseURL =
  "http://localhost:5000/astral-d3ff5/asia-southeast1/api";

const token = localStorage.FBIdToken;
if (token) {
  const decodedToken = jwtDecode(token);
  if (decodedToken.exp * 1000 < Date.now()) {
    store.dispatch(logoutUser());
    console.log("worked");
  } else {
    store.dispatch({
      type: SET_AUTHENTICATED,
    });
    axios.defaults.headers.common["Authorization"] = token;
    store.dispatch(getSessionData());
  }
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Menu />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/:campusID/:linkID/:admin" element={<Signup />} />
        <Route exact path="/home" element={<Home />} />
        <Route exact path="/college" element={<College />} />
      </Routes>
    </Router>
  );
}
{
  /* <div className="mt-[4rem] mx-[8rem]  px-[3.75rem] py-[3.75rem] flex rounded-lg bg-[#131A2E]"></div> */
}

export default App;
