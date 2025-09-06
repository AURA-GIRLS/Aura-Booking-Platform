import Navbar from "../components/generalUI/Navbar";
import Hero from "../components/sections/Hero";
import FeaturedLocations from "../components/sections/FeaturedLocations";
import FeaturedArtists from "../components/sections/FeaturedArtists";
import CallToAction from "../components/sections/CallToAction";
import Footer from "../components/generalUI/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeaturedLocations />
      <FeaturedArtists />
      <CallToAction />
      <Footer />
    </main>
  );
}
