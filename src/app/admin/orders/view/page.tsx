import React from "react";
import { FaTools, FaChartBar } from "react-icons/fa";

const AdminDashboardPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-6">
      <FaTools size={48} className="text-blue-600 mb-4 mx-auto" />
      <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-4">
        Orders Dashboard
        <FaChartBar size={24} className="inline align-middle text-blue-600" />
      </h1>
      <p>This page is under development.</p>
    </div>
  );
};

export default AdminDashboardPage;
