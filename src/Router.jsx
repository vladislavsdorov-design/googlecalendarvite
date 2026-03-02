import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import EmployeeView from "./EmployeeView";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/employee" element={<EmployeeView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
