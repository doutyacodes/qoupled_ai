import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Users, ChevronRight, Loader2 } from "lucide-react";
import { fetchConnectedUsers } from "@/app/_services/connectionService";

const BASE_IMAGE_URL = "https://wowfy.in/wowfy_app_codebase/photos/";

const ConnectedUsersList = ({ onUserSelect }) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const router = useRouter();
 
  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch connected users using the imported service function
  const { data, isLoading, error } = useQuery({
    queryKey: ["connectedUsers"],
    queryFn: fetchConnectedUsers
  });

  const users = data?.users || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">My Connections</h3>
        <button
          className="inline-flex items-center text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
          onClick={() => router.push("/my-matches")}
        >
          {users.length === 0 ? "Find Matches" : "View All"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
      
      {isLoading ? (
        <div className="px-6 py-8">
          <div className="flex flex-wrap gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className={`${isMobileView ? 'w-16 h-16' : 'w-24 h-24'} bg-gray-200 rounded-xl mb-2`}></div>
                <div className={`${isMobileView ? 'w-16' : 'w-24'} h-3 bg-gray-200 rounded mb-1`}></div>
                <div className={`${isMobileView ? 'w-10' : 'w-16'} h-3 bg-gray-200 rounded mx-auto`}></div>
              </div>
            ))}
          </div>
        </div>
      ) : error || users.length === 0 ? (
        <div className="px-6 py-12 flex flex-col items-center justify-center">
          <div className="bg-gray-50 rounded-full p-4 mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-gray-700 font-medium mb-1">No connections yet</h4>
          <p className="text-gray-500 text-sm mb-4 text-center max-w-xs">
            Connect with other users to start chatting and build your network
          </p>
          <button 
            onClick={() => router.push("/my-matches")}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors font-medium text-sm"
          >
            Find Matches
          </button>
        </div>
      ) : (
        <div className="px-6 py-5">
          <div className="flex overflow-x-auto gap-6 pb-2 scrollbar-hide">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
                onClick={() => onUserSelect(user.id)}
              >
                <div className={`relative ${isMobileView ? 'w-20 h-20' : 'w-28 h-28'} rounded-xl overflow-hidden transition-all duration-200 group-hover:shadow-md`}>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-rose-400 rounded-xl z-10 transition-colors"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img
                    src={user.profileImageUrl ? `${BASE_IMAGE_URL}${user.profileImageUrl}` : "/default-avatar.png"}
                    alt={user.username}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 right-2 bg-rose-500 rounded-full p-1.5 shadow-lg group-hover:bg-rose-600 transition-colors">
                    <MessageSquare className={`${isMobileView ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                  </div>
                </div>
                <p className={`mt-2 ${isMobileView ? 'text-xs' : 'text-sm'} font-medium text-gray-800 group-hover:text-rose-500 transition-colors`}>
                  {user.username}
                </p>
                <span className={`${isMobileView ? 'text-xs' : 'text-xs'} text-gray-400`}>
                  {user.lastActive ? 'Active now' : 'Tap to chat'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectedUsersList;