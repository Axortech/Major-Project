import React from "react";
import useLoading from "./useloading";
import "./loading.css";

const fetchData = async (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Welcome to InsightfulLens!");
    }, 2000);
  });
};

const Loading: React.FC = () => {
  const { loading, data } = useLoading(fetchData);

  return (
    <div className="loading-container">
      <div className="title">
        <h1>{loading ? "Loading..." : data}</h1>
      </div>
      <div className="keyboard">
        {["I", "N", "S", "I", "G", "H", "T", "F", "U", "L", "L", "E", "N", "S"].map((letter, index) => (
          <span key={index} className={`key ${loading ? "loading-effect" : ""}`}>
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Loading;
