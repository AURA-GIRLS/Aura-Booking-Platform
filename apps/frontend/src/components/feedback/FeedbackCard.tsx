"use client";

import { PencilSquareIcon, StarIcon, TrashIcon } from "@heroicons/react/24/solid";
import React from "react";

export interface FeedbackCardProps {
  feedback: { _id: string; rating: number; comment?: string };
  onEdit: () => void;
  onDelete: () => void;
}

function Star({ filled }: { filled: boolean }) {
  return (
    <StarIcon className={filled ? "h-6 w-6 text-[#FFC93C] drop-shadow" : "h-6 w-6 text-neutral-300"} />
  );
}

export default function FeedbackCard({ feedback, onEdit, onDelete }: FeedbackCardProps) {
  const rating = Math.max(1, Math.min(5, Number(feedback.rating) || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
      <h1 className="text-3xl font-semibold text-[#111]">Your Feedback</h1>
        <p className="mt-2 text-sm text-neutral-500">Thanks for your review! Here is what you shared with us.</p>
      </div>

      {/* Rating */}
      <div className="flex justify-center gap-5">
  {Array.from({ length: 5 }).map((_, i) => (
    <span key={i} className="inline-flex transform scale-[1.5] origin-center">
      <Star filled={i < rating} />
    </span>
  ))}
</div>

      {/* Comment */}
      {feedback.comment ? (
        <div>
          <div className="w-full rounded-2xl bg-[#F7FAFF] p-4 shadow-inner">
            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-gray-700">{feedback.comment}</p>
          </div>
          <p className="mt-2 text-center text-xs text-neutral-400">Your feedback helps us improve the experience for everyone 💖</p>
        </div>
      ) : (
        <p className="text-center text-sm text-neutral-500">No additional comments provided.</p>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Delete feedback"
          onClick={onDelete}
          className="px-6 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300/70 focus:ring-offset-2 rounded-full"
        >
          <span className="inline-flex items-center gap-2"><TrashIcon className="h-4 w-4" /> Delete</span>
        </button>
        <button
          type="button"
          aria-label="Edit feedback"
          onClick={onEdit}
          className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400/80 focus:ring-offset-2"
        >
          <span className="inline-flex items-center gap-2"><PencilSquareIcon className="h-4 w-4" /> Edit</span>
        </button>
      </div>
    </div>
  );
}