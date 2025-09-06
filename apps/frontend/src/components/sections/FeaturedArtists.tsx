"use client";
import { useState } from "react";

export default function FeaturedArtists() {
  const [artists] = useState([
    { name: "Tên Makeup Artist", rating: 4.8, reviews: 256, img: "/images/mua_1.jpg" },
    { name: "Tên Makeup Artist", rating: 4.7, reviews: 198, img: "/images/mua_2.jpg" },
    { name: "Tên Makeup Artist", rating: 4.9, reviews: 320, img: "/images/mua_1.jpg" },
    { name: "Tên Makeup Artist", rating: 4.6, reviews: 145, img: "/images/mua_1.jpg" },
  ]);

  const handleBooking = (artist: string) => {
    alert(`Bạn chọn đặt lịch với ${artist}`);
    // TODO: redirect to /booking/[artistId]
  };

  return (
    <section className="w-full bg-gray-50 py-16 px-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Chuyên gia trang điểm nổi bật</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {artists.map((artist, i) => (
          <div
            key={i}
            className="bg-white shadow-sm rounded-lg overflow-hidden text-center hover:shadow-md transition cursor-pointer"
            onClick={() => handleBooking(artist.name)}
          >
            <img
              src={artist.img}
              alt={artist.name}
              className="w-full h-44 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold">{artist.name}</h3>
              <p className="text-yellow-500 font-medium">⭐ {artist.rating}</p>
              <p className="text-sm text-gray-500">{artist.reviews} đánh giá</p>
              <button className="mt-3 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition">
                Đặt lịch
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
