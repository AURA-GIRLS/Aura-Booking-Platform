export default function Footer() {
    return (
      <footer className="w-full bg-gray-900 text-white px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">AURA</h3>
            <p>Đặt lịch makeup hoàn hảo cho những khoảnh khắc đẹp.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Về công ty</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>Giới thiệu</li>
              <li>Tin tức</li>
              <li>Liên hệ</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Điều khoản & Chính sách</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>Điều khoản dịch vụ</li>
              <li>Chính sách bảo mật</li>
              <li>Chính sách hoàn tiền</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Hỗ trợ</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>Câu hỏi thường gặp</li>
              <li>Trợ giúp</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-400 mt-10">
          © AURA 2025 - Face it, You are Art!
        </div>
      </footer>
    );
  }
  