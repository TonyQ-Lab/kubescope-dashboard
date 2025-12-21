import SideBar from "./components/SideBar";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <main className="flex-1 overflow-y-auto lg:px-2">
        {children}
      </main>
    </div>
  );
}