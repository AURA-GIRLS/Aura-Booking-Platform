"use client";

import React, { useEffect, useMemo, useState } from "react";
import FeedbackForm from "./FeedbackForm";
import FeedbackCard from "./FeedbackCard";
import { deleteFeedback, getMyFeedback } from "../../lib/api";
import { StarIcon, XIcon } from "lucide-react";

type BookingLite = {
  _id: string;
  status: string;
  feedbackId?: string | null;
};

const COMPLETED_SET = new Set(["COMPLETED"]);

export default function FeedbackActions({ booking }: { booking: BookingLite }) {
  const isCompleted = useMemo(() => COMPLETED_SET.has((booking?.status || "").toUpperCase()), [booking?.status]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [mode, setMode] = useState<"view" | "create" | "edit">("create");

  useEffect(() => {
    if (!isCompleted) return;
    // Always check existence for completed bookings
    const maybeFetch = async () => {
      try {
        setLoading(true);
        const data = await getMyFeedback(booking._id);
        if (data && data._id) {
          setFeedback(data);
          setMode("view");
        } else {
          setFeedback(null);
          setMode("create");
        }
      } catch (e: any) {
        setFeedback(null);
        setMode("create");
      } finally {
        setLoading(false);
      }
    };
    void maybeFetch();
  }, [booking._id, isCompleted]);

  if (!isCompleted) return null;

  const handleOpenCreate = async () => {
    setMode("create");
    setOpen(true);
  };

  const handleOpenView = () => {
    setMode("view");
    setOpen(true);
  };

  const handleOpenEdit = () => {
    setMode("edit");
    setOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (!feedback?._id) return;
      if (!window.confirm("Are you sure you want to delete your feedback? This action cannot be undone.")) return;
      await deleteFeedback(feedback._id);
      setFeedback(null);
      setMode("create");
    } catch (e: any) {
      alert(e?.message || e?.code || "Error");
    }
  };

  const Stars = ({ value }: { value: number }) => (
    <span aria-label={`rating ${value} out of 5`} className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} className={i < value ? "h-4 w-4 text-yellow-400" : "h-4 w-4 text-gray-300"} />
      ))}
    </span>
  );

  return (
    <div className="relative z-10">
      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200" />
      ) : feedback ? (
          <button
            type="button"
            onClick={handleOpenView}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-400/80 focus:ring-offset-2"            >
            View feedback
          </button>
      ) : (
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-400/80 focus:ring-offset-2"        >
          Give Feedback
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex animate-fade-in-fast items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white/70 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-2 flex justify-end">
              {/* <h2 className="text-xl font-bold text-gray-800">
                {mode === "edit" ? "Edit Feedback" : mode === "view" ? "Your Feedback" : "Give Feedback"}
              </h2> */}
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-500/10 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400/80"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {mode === "view" && feedback ? (
              <FeedbackCard
                feedback={{ _id: feedback._id, rating: feedback.rating, comment: feedback.comment }}
                onEdit={() => setMode("edit")}
                onDelete={async () => {
                  await handleDelete();
                  setOpen(false);
                }}
              />
            ) : (
              <FeedbackForm
                bookingId={booking._id}
                defaultValue={mode === "edit" && feedback ? { id: feedback._id, rating: feedback.rating, comment: feedback.comment } : undefined}
                onSuccess={(res) => {
                  setFeedback(res);
                  setMode("view");
                  // Do not close on success, user should see the result
                }}
                onCancel={() => {
                  if (mode === "edit") setMode("view");
                  else setOpen(false);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
