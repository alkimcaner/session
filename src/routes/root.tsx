import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
}
