"use client";
export default function FeaturedLocations() {
    const cities = [
      { name: "Hà Nội", img: "/images/hanoi.jpg" },
      { name: "Hồ Chí Minh", img: "/images/hcm.jpg" },
      { name: "Đà Nẵng", img: "/images/danang.jpg" },
      { name: "Hội An", img: "/images/danang.jpg" },
    ];
  
    return (
      <section className="w-full bg-gray-50 py-16 px-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          Trang điểm tôn lên vẻ đẹp tự nhiên của bạn
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cities.map((city, i) => (
            <div
              key={i}
              className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <img
                src={city.img}
                alt={city.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="font-semibold">{city.name}</h3>
                <p className="text-sm text-gray-500">XXX Makeup Artist</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  