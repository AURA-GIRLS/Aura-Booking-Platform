"use client";

import { Check } from "lucide-react";
import { UserWallResponseDTO } from "@/types/community.dtos";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { USER_ROLES } from "@/constants/index";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../lib/ui/tooltip";
import { motion } from "framer-motion";

export default function StoriesSection({
  userWalls,
  currentUser,
}: {
  userWalls: UserWallResponseDTO[];
  currentUser: UserWallResponseDTO;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const handleOpenWall = useCallback(
    (user: UserWallResponseDTO) => {
      try {
        const sp = new URLSearchParams(searchParams?.toString());
        sp.set("wall", String(user._id));
        if (user.fullName) sp.set("wn", user.fullName);
        else sp.delete("wn");
        const qs = sp.toString();
        router.push((qs ? `${pathname}?${qs}` : pathname) as any, {
          scroll: false,
        });
      } catch {
        // ignore
      }
    },
    [pathname, router, searchParams]
  );

  return (
    <motion.div
      className="bg-white rounded-xl p-4 mb-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}     // 👈 fade + slide
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex space-x-4 overflow-x-auto pb-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1, // 👈 delay animation từng item
            },
          },
        }}
      >
        {/* Current user wall */}
        <motion.div
          className="flex-shrink-0 text-center cursor-pointer"
          whileHover={{ scale: 1.05 }}    // 👈 hover zoom nhẹ
          whileTap={{ scale: 0.95 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <div className="w-fit h-fit rounded-full p-1 bg-gradient-to-br from-rose-500 to-rose-700">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center"></div>
          </div>
          <p className="text-xs mt-1 text-gray-600">Users's Wall</p>
        </motion.div>

        {/* Other user walls */}
        {userWalls.map((wall) => (
          <motion.button
            key={wall._id}
            onClick={() => {
              handleOpenWall(wall);
            }}
            className="flex-shrink-0 text-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="relative">
              {wall.avatarUrl ? (
                <div className="w-fit h-fit rounded-full p-1 bg-gradient-to-br from-rose-500 to-rose-700">
                  <img
                    src={wall.avatarUrl}
                    alt={`${wall.fullName}'s avatar`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-fit h-fit rounded-full p-1 bg-gradient-to-br from-rose-500 to-rose-700">
                  <div className="w-16 h-16 bg-gradient-to-br from-neutral-700 to-black rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(wall.fullName)}
                    </span>
                  </div>
                </div>
              )}

              {wall.role &&
                wall.role.toUpperCase() === USER_ROLES.ARTIST && (
                  <span className="absolute -bottom-1 -right-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center justify-center rounded-full bg-rose-600 p-[0.2rem]">
                            <Check
                              className="w-3 h-3 text-white font-semibold"
                              aria-hidden="true"
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 text-white text-xs">
                          <p>Verified Artist badge</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                )}
            </div>
            <p className="text-xs mt-1 text-gray-600">
              {wall.fullName.split(" ")[0]}'s Wall
            </p>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
