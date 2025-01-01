import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import baseUrl from "../../config/baseUrl";

import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { username: username, email: email, password: password };

    try {
      setError("");

      await axios.post(`${baseUrl}/users/register`, userData);

      navigate("/login");
    } catch (err) {
      setError(
        err.response
          ? err.response.data.message
          : "Something went wrong on register attempt!"
      );
    }
  };

  return (
    <main className="flex flex-row-reverse justify-center items-center">
      <div className="hidden lg:block">
        <img
          src="/images/register.jpg"
          width={925}
          height={976}
          alt=""
          className="h-[100vh] w-[50vw] object-cover blur-sm"
        />
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
        <div className="sm:w-[145%] w-[125%] bg-white rounded-lg shadow-2xl border-[2px] border-slate-100 md:mt-0 xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold text-slate-700 md:text-2xl">
              Register
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-slate-700"
                >
                  Username:
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  autoComplete="off"
                  className="bg-slate-50 border border-slate-300 text-slate-700 sm:text-sm rounded-lg block w-full p-2.5 focus:border-0 focus:outline-0 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-slate-700"
                >
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  autoComplete="off"
                  className="bg-slate-50 border border-slate-300 text-slate-700 sm:text-sm rounded-lg block w-full p-2.5 focus:border-0 focus:outline-0 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-slate-700"
                >
                  Password:
                </label>
                <div className="relative">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    autoComplete="off"
                    className="bg-slate-50 border border-slate-300 text-slate-700 sm:text-sm rounded-lg block w-full p-2.5 focus:border-0 focus:outline-0 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                  >
                    {isPasswordVisible ? (
                      <FaRegEyeSlash size="26px" />
                    ) : (
                      <FaRegEye size="26px" />
                    )}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className="mb-2 w-full block text-white bg-blue-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Submit
              </button>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              <p className="text-sm font-light text-slate-500">
                Already have an account?{" "}
                <Link
                  to={"/login"}
                  className="font-medium text-blue-500 hover:underline"
                >
                  Login here.
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;