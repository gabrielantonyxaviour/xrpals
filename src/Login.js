import React from "react";
import background from "./assets/secondbg.jpg";
import logo from "./assets/logo.png";
export default function Login() {
  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="h-100 d-flex justify-content-center align-items-center ">
        <form className="p-5 bg-white rounded">
          <div className="d-flex m-2 justify-content-between mb-4">
            <img
              src={logo}
              className="rounded-circle border border-dark"
              style={{ width: "40px", height: "40px", marginRight: "10px" }}
            />
            <h2 style={{ fontFamily: "Rubik Vinyl" }}>XRPaLs</h2>
          </div>
          <div className="form-outline mb-4">
            <input type="text" id="form2Example1" className="form-control" />
            <label className="form-label" for="form2Example1">
              Account Seed
            </label>
          </div>

          <button
            type="button"
            className="d-flex btn btn-primary btn-block mb-4"
            style={{ margin: "auto" }}
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
