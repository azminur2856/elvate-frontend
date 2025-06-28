// "use client";
// import { useEffect, useState } from "react";
// import api from "@/lib/authAxios";

// type ActivityLog = {
//   id: number;
//   activity: string;
//   description: string;
//   createdAt: string;
//   userId: string | null;
// };

// type ActivityLogsResponse = {
//   logs: ActivityLog[];
//   total: number;
//   page: number;
//   pageSize: number;
//   totalPages: number;
// };

// export default function ActivityLogsPage() {
//   const [logs, setLogs] = useState<ActivityLog[]>([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false); // loading now only controls overlay
//   const [firstLoad, setFirstLoad] = useState(true);

//   const pageSize = 5;

//   useEffect(() => {
//     let isCancelled = false;
//     const fetchLogs = async () => {
//       setLoading(true);
//       try {
//         const res = await api.get<ActivityLogsResponse>(
//           `/activity-logs/user?page=${page}&pageSize=${pageSize}`
//         );
//         if (!isCancelled) {
//           setLogs(res.data.logs);
//           setTotalPages(res.data.totalPages);
//           setFirstLoad(false);
//         }
//       } catch {
//         if (!isCancelled) {
//           setLogs([]);
//           setTotalPages(1);
//         }
//       }
//       if (!isCancelled) setLoading(false);
//     };
//     fetchLogs();
//     return () => {
//       isCancelled = true;
//     };
//     // eslint-disable-next-line
//   }, [page]);

//   return (
//     <div className="min-h-screen bg-black flex flex-col items-center py-25 font-sans">
//       <h1 className="text-3xl font-bold text-white mb-8 text-center">
//         Activity Logs
//       </h1>
//       <div className="w-full max-w-4xl relative">
//         {/* Loading overlay */}
//         {loading && !firstLoad && (
//           <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 rounded-lg">
//             <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
//             <span className="text-white font-medium">Loading...</span>
//           </div>
//         )}
//         {firstLoad && loading ? (
//           <div className="text-center text-neutral-400 py-20">Loading...</div>
//         ) : logs.length === 0 ? (
//           <div className="text-center text-neutral-400 py-20">
//             No activity logs found.
//           </div>
//         ) : (
//           <div className="overflow-x-auto relative">
//             <table className="min-w-full bg-neutral-900 border border-neutral-800 rounded-lg">
//               <thead>
//                 <tr>
//                   <th className="px-4 py-2 text-neutral-300">#</th>
//                   <th className="px-4 py-2 text-neutral-300">Activity</th>
//                   <th className="px-4 py-2 text-neutral-300">Description</th>
//                   <th className="px-4 py-2 text-neutral-300">Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {logs.map((log, idx) => (
//                   <tr
//                     key={log.id}
//                     className="border-t border-neutral-800 hover:bg-neutral-800/70"
//                   >
//                     <td className="px-4 py-2 text-neutral-100">
//                       {(page - 1) * pageSize + idx + 1}
//                     </td>
//                     <td className="px-4 py-2 text-neutral-100">
//                       {log.activity}
//                     </td>
//                     <td className="px-4 py-2 text-neutral-100">
//                       {log.description}
//                     </td>
//                     <td className="px-4 py-2 text-neutral-400 text-xs">
//                       {new Date(log.createdAt).toLocaleString()}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//         {/* Pagination Controls */}
//         <div className="flex items-center justify-between mt-6">
//           <div className="text-neutral-400 text-sm">
//             Page {page} of {totalPages}
//           </div>
//           <div className="flex gap-2">
//             <button
//               className="px-4 py-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50"
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//             >
//               Previous
//             </button>
//             <button
//               className="px-4 py-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50"
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import api from "@/lib/authAxios";

type ActivityLog = {
  id: number;
  activity: string;
  description: string;
  createdAt: string;
  userId: string | null;
};

type ActivityLogsResponse = {
  logs: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const pageSize = 5;

  useEffect(() => {
    let isCancelled = false;
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get<ActivityLogsResponse>(
          `/activity-logs/user?page=${page}&pageSize=${pageSize}`
        );
        if (!isCancelled) {
          setLogs(res.data.logs);
          setTotalPages(res.data.totalPages);
        }
      } catch {
        if (!isCancelled) {
          setLogs([]);
          setTotalPages(1);
        }
      }
      if (!isCancelled) setLoading(false);
    };
    fetchLogs();
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line
  }, [page]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-25 px-2 font-sans">
      <div className="max-w-4xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Activity Logs</h1>
          <p className="text-neutral-400 text-sm">
            Review the latest activity events below.
          </p>
        </div>
        <div className="relative rounded-lg border border-neutral-800 bg-neutral-900 shadow-lg overflow-hidden">
          {/* Spinner overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            </div>
          )}
          {logs.length === 0 && !loading ? (
            <div className="text-center text-neutral-400 py-20">
              No activity logs found.
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-neutral-800 text-neutral-300">
                  <th className="px-4 py-3 text-center font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Activity</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-neutral-500"
                    >
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className={
                        "transition-colors " +
                        (idx % 2 === 0 ? "bg-neutral-900" : "bg-neutral-950") +
                        " hover:bg-neutral-800/70"
                      }
                    >
                      <td className="px-4 py-3 text-center text-neutral-400">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-4 py-3 text-neutral-100 font-semibold">
                        {log.activity}
                      </td>
                      <td className="px-4 py-3 text-neutral-100 break-all">
                        {log.description}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-neutral-400 text-sm">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="px-4 py-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
