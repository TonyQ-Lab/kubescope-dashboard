import { NavLink } from "react-router";

export default function SubNavLink({ item }) {
    return (
    <NavLink
        key={item.path}
        to={item.path}
            className={({ isActive }) =>
            `
            pl-14 px-3 py-2 text-sm rounded-md transition
            ${
                isActive
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800/40"
            }
            `
        }
        >
        {item.label}
    </NavLink>
    )
}