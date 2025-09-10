import ArtistsList from "@/components/makeup-artist/ArtistsList";
import Navbar from "@/components/generalUI/Navbar";
import Footer from "@/components/generalUI/Footer";
export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ArtistsList />
      <Footer />
    </main>
  );
}