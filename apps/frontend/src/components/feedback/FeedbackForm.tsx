"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import React, { useMemo, useState } from "react";

import { createFeedback, updateFeedback } from "../../lib/api";

export interface FeedbackFormProps {
  bookingId: string;
  defaultValue?: { id?: string; rating?: number; comment?: string } | null;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

function StarRatingInput({ value, onChange, disabled }: { value: number; onChange: (value: number) => void; disabled?: boolean }) {
  const [hoverValue, setHoverValue] = useState(0);
  const stars = Array.from({ length: 5 });

  return (
    <div className="flex justify-center gap-3" onMouseLeave={() => setHoverValue(0)} aria-disabled={disabled}>
      {stars.map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hoverValue || value);

        return (
          <label
            key={starValue}
            className={`cursor-pointer transition-transform hover:scale-105 ${disabled ? "pointer-events-none opacity-60" : ""}`}
            onMouseEnter={() => !disabled && setHoverValue(starValue)}
          >
            <input
              type="radio"
              name="rating"
              value={starValue}
              checked={starValue === value}
              onChange={() => onChange(starValue)}
              className="hidden"
              disabled={disabled}
            />
            <StarIcon className={`h-10 w-10 ${isActive ? "text-[#FFC93C] drop-shadow" : "text-neutral-300"}`} />
          </label>
        );
      })}
    </div>
  );
}

export default function FeedbackForm({ bookingId, defaultValue, onSuccess, onCancel }: FeedbackFormProps) {
  const isEdit = useMemo(() => Boolean(defaultValue?.id), [defaultValue]);
  const [rating, setRating] = useState<number>(defaultValue?.rating ?? 0);
  const [comment, setComment] = useState<string>(defaultValue?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);
  const [success, setSuccess] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess("");
    try {
      if (rating === 0) {
        setError({ message: "Please select a rating." });
        setLoading(false);
        return;
      }

      let res;
      if (isEdit && defaultValue?.id) {
        res = await updateFeedback(defaultValue.id, {
          rating: rating,
          comment: comment,
        });
      } else {
        res = await createFeedback({ bookingId, rating: rating, comment });
      }
      setSuccess(isEdit ? "Feedback updated successfully." : "Feedback created successfully.");
      onSuccess?.(res);
    } catch (err: any) {
      setError({ code: err?.code, message: err?.message || "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-2xl font-semibold text-[#111]">Rate your experience</h3>
        <p className="mb-2 max-w-prose mx-auto text-sm text-neutral-500">We highly value your feedback! Kindly take a moment to rate your experience and provide us with your valuable feedback.</p>
      </div>

      <form onSubmit={onSubmit} className="w-full overflow-hidden">
        <fieldset disabled={loading} className="grid gap-6">
          <div className="grid gap-3">
            <StarRatingInput value={rating} onChange={setRating} disabled={loading} />
          </div>

          <div className="grid gap-2">
            <textarea
              id="comment"
              name="comment"
              aria-label="comment"
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[120px] rounded-2xl bg-[#F7FAFF] shadow-inner p-4 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
              placeholder="Tell us about your experience!"
            />
          </div>

          {error ? (
            <div role="alert" className="text-center text-sm text-rose-700">{error.message}</div>
          ) : null}

          {success ? (
            <div role="status" className="text-center text-sm text-green-700">{success}</div>
          ) : null}

          <div className="mt-2 flex justify-center gap-3">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
            ) : null}
            <button
              type="submit"
              aria-busy={loading}
              className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 font-medium shadow-lg hover:brightness-110 active:translate-y-px disabled:opacity-60 disabled:active:translate-y-0"
            >
              {loading ? "Sending..." : isEdit ? "Save Changes" : "Send"}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}