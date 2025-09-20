import Image from 'next/image';

export default function AboutPage() {
  return (
    <>
        {/* Hero */}
      <section className="mb-10">
        {/* Full-bleed container to span entire viewport width */}
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden h-[48vh] sm:h-[56vh] md:h-[64vh]">
          {/* Silver gradient background */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400"
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* ABOUT US heading */}
      <section className="mb-10">
        <h1 className="text-5xl md:text-7xl font-extrabold italic tracking-tight text-black">ABOUT US</h1>
      </section>

      {/* Brand intro */}
      <section className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-3xl font-bold mb-3">AURA.</h2>
          <p className="text-gray-600 leading-relaxed">
            AURA was born out of an idea to connect clients and makeup artists through a seamless, modern experience—
            online and in-person. Since our start, we’ve focused on bridging craft and technology to offer sophisticated,
            comfortable booking experiences for a modern, on‑the‑go lifestyle.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            From casual events to milestone moments, AURA helps you find the right artist, discover looks, and book with
            confidence.
          </p>
        </div>
        <div className="hidden lg:block" />
      </section>

      {/* History section with side image */}
      <section className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src="/images/brand.jpg"
              alt="Makeup artists on location"
              width={1200}
              height={800}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-wide mb-3">HISTORY OF THE BRAND</h3>
          <p className="text-gray-600 leading-relaxed">
            AURA launched with a desire to challenge convention in beauty services and modernize how people discover and
            book professionals. We started with a simple idea: make artistry more accessible while respecting the
            craft—and the people behind it.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Today, AURA connects clients and artists across cities with a growing community and curated experiences—
            from weddings and editorial shoots to everyday confidence.
          </p>
        </div>
      </section>

      {/* Promise */}
      <section className="mb-14 text-center max-w-3xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-extrabold">OUR PROMISE</h3>
        <p className="mt-4 text-gray-600 leading-relaxed">
          We aim to leave a mark through the experiences we craft. By being bold and focusing on quality, we push limits
          and redefine how beauty services are discovered, booked, and delivered. AURA is the bridge—connecting cultures,
          ideas, artists, and communities.
        </p>
      </section>

      {/* Wide image */}
      <section className="mb-16">
        <div className="relative w-full overflow-hidden rounded-xl">
          <Image
            src="/images/smile2.jpg"
            alt="Wide scenic banner"
            width={1600}
            height={700}
            className="w-1/2 h-auto object-cover mx-auto rounded-2xl"
          />
        </div>
      </section>
      </div>
    </>
  );
}


