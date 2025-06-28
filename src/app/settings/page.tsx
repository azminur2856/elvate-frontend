import React from "react";
import { FaTools, FaHourglassHalf } from "react-icons/fa";

const SettingsPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-6">
      <FaTools size={60} color="#888" />
      <h1 className="text-3xl font-bold">Settings</h1>
      <FaHourglassHalf size={40} color="#888" />
      <p className="text-lg text-gray-600">
        This page is under development.
        <br />
        <strong>Coming soon!</strong>
      </p>
    </div>
  );
};

export default SettingsPage;
