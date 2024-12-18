import XSvg from "../svgs/X";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {

  const queryClient = useQueryClient();

  const { mutate: logoutMutation } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });

        const authUser = await res.json();
        if (!res.ok) {
		 throw new Error(authUser.error || "Something went wrong");}
			
        return authUser;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["authUser"]})
    },
	onError: () => {
		toast.error("Logut Failed")
	}
  });

  const handleLogout = (e) => {
	e.preventDefault(); 
    logoutMutation();
  };

  const {data: authUser} = useQuery({queryKey: ["authUser"]});
  const {data: notifications} = useQuery({queryKey: ["notifications"]})//to get the notifications length

  return (
    <div className="fixed z-10 top-0 md:sticky md:z-0 md:block md:flex-[2_2_0] md:max-w-52">
      <div className="bg-opacity-85 md:bg-opacity-0  bg-black h-20 w-screen md:bg-none fixed md:sticky top-0 left-0 md:h-screen flex md:flex-col border-r border-gray-700 md:w-full">
        <Link to="/" className="flex justify-center md:justify-start">
          <XSvg className="mt-4 md:mt-0 px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
        </Link>
        <ul className="flex w-full justify-around items-center md:justify-start md:items-start md:flex-col gap-3 md:mt-4">
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <MdHomeFilled className="w-8 h-8" />
              <span className="text-lg hidden md:block">Home</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/notifications"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <IoNotifications className="w-6 h-6" />
              {notifications && 
              <div className="flex items-center justify-center absolute z-10 ml-3 mb-2 bg-pink-600 rounded-full h-3 w-3 text-center">
              <span style={{fontSize: '8px'}}>{notifications.length}</span>
              </div>
              }
              <span className="text-lg hidden md:block">Notifications</span>
            </Link>
          </li>

          <li className="flex justify-center md:justify-start">
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <FaUser className="w-6 h-6" />
              <span className="text-lg hidden md:block">Profile</span>
            </Link>
          </li>
        </ul>
        {authUser && (
          <Link
            to={`/profile/${authUser.username}`}
            className="mt-5 md:mt-auto md:mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full"
          >
            <div className="avatar hidden md:inline-flex">
              <div className="w-8 rounded-full">
                <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
              </div>
            </div>
            <div className="flex justify-between flex-1">
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm w-20 truncate">
                  {authUser?.fullName}
                </p>
                <p className="text-slate-500 text-sm">@{authUser?.username}</p>
              </div>
              <BiLogOut
                className="w-5 h-5 cursor-pointer"
                onClick={handleLogout}
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
