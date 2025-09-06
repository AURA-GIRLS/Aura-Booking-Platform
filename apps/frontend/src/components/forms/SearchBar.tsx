"use client";
import { useState } from "react";
import { Calendar, MapPin, Sparkles } from "lucide-react";

export default function SearchBar() {
  const [form, setForm] = useState({ location: "", date: "", style: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Tìm kiếm: ${form.location}, ${form.date}, ${form.style}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="-mt-8 mx-auto max-w-3xl bg-white shadow-lg rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-3"
    >
      {/* Location */}
      <div className="relative">
        <MapPin className="w-5 h-5 text-pink-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          name="location"
          placeholder="Địa điểm"
          value={form.location}
          onChange={handleChange}
          className="h-12 w-full border rounded-md pl-10 pr-3"
        />
      </div>

      {/* Date */}
      <div className="relative">
        <Calendar className="w-5 h-5 text-pink-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="h-12 w-full border rounded-md pl-10 pr-3"
        />
      </div>

      {/* Style */}
      <div className="relative">
        <Sparkles className="w-5 h-5 text-pink-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <select
          name="style"
          value={form.style}
          onChange={handleChange}
          className="h-12 w-full border rounded-md pl-10 pr-3"
        >
          <option value="">Phong cách</option>
          <option value="tự nhiên">Tự nhiên</option>
          <option value="cổ điển">Cổ điển</option>
          <option value="dạ tiệc">Dạ tiệc</option>
        </select>
      </div>

      {/* Button */}
      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="h-12 w-full md:w-auto bg-blue-600 text-white px-6 rounded-md hover:bg-blue-700"
        >
          Tìm Makeup Artist
        </button>
      </div>
    </form>
  );
}
