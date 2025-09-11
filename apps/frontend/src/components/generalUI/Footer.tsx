export default function Footer() {
  return (
    <footer
      className="w-full px-12 py-16 border-t bg-pink-50 text-[#191516] font-sans"
      style={{
        borderTop: "2px solid #FFD9DA",
        fontFamily: 'Montserrat, Poppins, Arial, sans-serif',
        letterSpacing: '0.04em',
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3
            className="font-black text-2xl mb-2 tracking-widest"
            style={{ color: '#EB638B', fontFamily: 'Montserrat, Poppins, Arial, sans-serif' }}
          >
            AURA
          </h3>
          <p className="text-[#AC274F] text-sm">Đặt lịch makeup hoàn hảo cho những khoảnh khắc đẹp.</p>
        </div>
        <div>
          <h4 className="font-bold mb-2 text-[#EB638B] uppercase text-base tracking-wide">Về công ty</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Giới thiệu</li>
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Tin tức</li>
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Liên hệ</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2 text-[#EB638B] uppercase text-base tracking-wide">Điều khoản & Chính sách</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Điều khoản dịch vụ</li>
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Chính sách bảo mật</li>
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Chính sách hoàn tiền</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2 text-[#EB638B] uppercase text-base tracking-wide">Hỗ trợ</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Câu hỏi thường gặp</li>
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Trợ giúp</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-sm mt-10 tracking-widest" style={{ color: '#EB638B', fontWeight: 700 }}>
        © AURA 2025 - Face it, You are Art!
      </div>
    </footer>
  );
}
  