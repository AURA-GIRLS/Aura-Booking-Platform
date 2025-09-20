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
          <p className="text-[#AC274F] text-sm">
            Book flawless makeup appointments for your most beautiful moments.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-2 text-[#EB638B] uppercase text-base tracking-wide">Company</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-[#382E31] hover:text-[#EB638B] transition">About Us</li>
            <li className="text-[#382E31] hover:text-[#EB638B] transition">News</li>
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2 text-[#EB638B] uppercase text-base tracking-wide">Terms & Policies</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Terms of Service</li>
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Privacy Policy</li>
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Refund Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2 text-[#EB638B] uppercase text-base tracking-wide">Support</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-[#382E31] hover:text-[#EB638B] transition">FAQ</li>
            <li className="text-[#382E31] hover:text-[#EB638B] transition">Help Center</li>
          </ul>
        </div>
      </div>
      <div
        className="text-center text-sm mt-10 tracking-widest"
        style={{ color: '#EB638B', fontWeight: 700 }}
      >
        © AURA 2025 - Face it, You are Art!
      </div>
    </footer>
  );
}
