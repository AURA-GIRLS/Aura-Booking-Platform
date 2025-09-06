import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="bg-pink-100 py-16 text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Bạn đang không biết chọn MUA nào?
      </h2>
      <p className="mb-6 text-gray-600">
        Hãy để AURA giúp bạn tỏa sáng trong ngày đặc biệt!
      </p>
      <Link
        href="/booking"
        className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
      >
        Đặt Lịch Ngay!
      </Link>
    </section>
  );
}
