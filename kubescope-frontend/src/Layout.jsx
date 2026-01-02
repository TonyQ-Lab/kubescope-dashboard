import SideBar from "./components/SideBar";
import { useState } from "react";

export default function Layout({ children }) {
  const [sideBarWidth, setSideBarWidth] = useState(260);

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar width={sideBarWidth} onResize={setSideBarWidth} />
      <main className="flex-1 overflow-y-auto lg:px-2">
        {children}
      </main>
    </div>
  );
}