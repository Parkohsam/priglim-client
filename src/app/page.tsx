"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useQuery } from "@apollo/client/react";
import { GET_PACKAGES } from "@/graphql/queries";

interface Package {
  id: string;
  title: string;
  type: string;
  price: number;
  duration: string;
  availabilityStatus: string;
  images: string[];
}

function getBadge(type: string) {
  if (type === "hajj") return { label: "Premium", color: "bg-gold text-navy-deep" };
  if (type === "ramadan_umrah") return { label: "Limited Time", color: "bg-red text-white" };
  return { label: "Popular", color: "bg-navy text-white" };
}

const testimonials = [
  {
    name: "Dr. Ademola Rauf Salami",
    location: "Oyo State",
    quote:
      "Everything was handled professionally — visa, flight, hotel. I didn't have to worry about anything throughout the whole trip.",
    initials: "AY",
  },
  {
    name: "Alhaji Aykub Alubata",
    location: "Oyo State",
    quote:
      "My first Umrah and it went smoothly from booking to landing back home. The team kept me updated every step of the way.",
    initials: "FB",
  },
  {
    name: "Alhaja Seliatu Alubata",
    location: "Oyo State",
    quote:
      "Booked for my parents and myself. Clear communication, fair pricing, and the hotel was exactly as described.",
    initials: "IS",
  },
];

export default function HomePage() {
  const { data } = useQuery<{ packages: Package[] }>(GET_PACKAGES);
  const featured = data?.packages
    .filter((p) => p.availabilityStatus === "open")
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <section className="relative bg-gradient-to-br from-navy-deep via-navy to-navy-deep overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gold" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-block bg-gold/20 text-gold text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              ★ Trusted Umrah &amp; Hajj Agency
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Book Your Hajj &amp; Umrah Journey
            </h1>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto lg:mx-0">
              Trusted, all-inclusive packages for the pilgrimage of a lifetime —
              visa, flights, and hotel handled for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/packages"
                className="bg-white text-navy-deep font-medium rounded px-8 py-3 hover:bg-cream transition-colors"
              >
                Explore Packages
              </Link>
              <Link
                href="/login"
                className="border border-white/30 text-white font-medium rounded px-8 py-3 hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="relative mt-10 lg:mt-0">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1553755088-ef1973c7b4a1?auto=format&fit=crop&w=800&q=80"
                alt="The Kaaba at Masjid al-Haram, Mecca"
                className="w-full h-56 sm:h-72 lg:h-96 object-cover"
              />
            </div>

            <div className="absolute -bottom-4 left-3 right-3 sm:left-auto sm:right-auto sm:-bottom-6 sm:-left-6 bg-white rounded-lg shadow-xl p-3 sm:p-4 max-w-[200px] sm:max-w-[220px]">
              <div className="flex text-gold text-xs sm:text-sm mb-1">{"★★★★★"}</div>
              <p className="text-[11px] sm:text-xs text-navy-deep/70 mb-2">
                &ldquo;Smooth from booking to landing back home.&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-navy text-white flex items-center justify-center text-[9px] sm:text-[10px] font-semibold">
                  FB
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-navy-deep">
                  Fatima Bello
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {featured && featured.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-2xl font-bold text-navy-deep mb-2 text-center">
            Featured Packages
          </h2>
          <p className="text-navy-deep/60 text-center mb-10">
            A few of our current offerings
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/packages/${pkg.id}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {pkg.images && pkg.images.length > 0 ? (
                  <div className="h-40 bg-navy-deep">
                    <img
                      src={pkg.images[0]}
                      alt={pkg.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative h-40 bg-navy overflow-hidden">
                    <svg
                      viewBox="0 0 400 160"
                      preserveAspectRatio="none"
                      className="absolute inset-0 h-full w-full"
                    >
                      <path
                        d="M0,160 L0,70 Q100,-10 200,70 Q300,-10 400,70 L400,160 Z"
                        className="fill-navy-deep/50"
                      />
                    </svg>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="absolute right-4 top-4 h-6 w-6 text-gold"
                    >
                      <path
                        d="M12 3a7 7 0 1 0 6.3 10 8 8 0 0 1-6.3-10Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block text-xs font-medium text-gold uppercase tracking-wide">
                      {pkg.type.replace("_", " ")}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${getBadge(pkg.type).color}`}
                    >
                      {getBadge(pkg.type).label}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-deep mb-3">
                    {pkg.title}
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-navy font-bold">
                      ₦{pkg.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-navy-deep/60">
                      {pkg.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-navy-deep/10 pt-4">
                    <span className="text-sm font-semibold text-navy group-hover:text-navy-deep transition-colors">
                      View package
                    </span>
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-4 w-4 text-navy group-hover:translate-x-1 transition-transform"
                    >
                      <path
                        d="M4 10h12M11 5l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/packages" className="text-navy font-medium">
              View all packages →
            </Link>
          </div>
        </section>
      )}

      <section id="about" className="bg-white border-t border-navy-deep/10">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-2xl font-bold text-navy-deep mb-2 text-center">
            About Priglim
          </h2>
          <p className="text-navy-deep/60 text-center mb-12 max-w-2xl mx-auto">
            Operated by ABC Travels, Logistics and Forwarding — helping
            pilgrims journey to the Holy Land with confidence.
          </p>

          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-navy font-bold">✓</span>
              </div>
              <h3 className="font-semibold text-navy-deep mb-2">
                All-Inclusive Packages
              </h3>
              <p className="text-sm text-navy-deep/60">
                Visa, flights, and hotel handled in one booking — no juggling
                separate arrangements.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-navy font-bold">✓</span>
              </div>
              <h3 className="font-semibold text-navy-deep mb-2">
                Secure Payments
              </h3>
              <p className="text-sm text-navy-deep/60">
                Every payment is verified and every booking reviewed before
                confirmation.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-navy font-bold">✓</span>
              </div>
              <h3 className="font-semibold text-navy-deep mb-2">
                Dedicated Support
              </h3>
              <p className="text-sm text-navy-deep/60">
                Real people guiding you from booking through to your return
                home.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-2xl font-bold text-navy-deep mb-2 text-center">
            What Our Pilgrims Say
          </h2>
          <p className="text-navy-deep/60 text-center mb-12">
            Trusted by travelers across Nigeria
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex text-gold mb-3">{"★★★★★"}</div>
                <p className="text-navy-deep/70 text-sm mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center text-sm font-semibold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-deep">
                      {t.name}
                    </p>
                    <p className="text-xs text-navy-deep/50">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-navy-deep text-white">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <h2 className="text-lg font-bold mb-4">Priglim</h2>
              <p className="text-white/60 text-sm">
                Operated by ABC Travels, Logistics and Forwarding Nig Ltd.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gold uppercase tracking-wide mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/packages" className="hover:text-white">All Packages</Link></li>
                <li><Link href="/#about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white">Register</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gold uppercase tracking-wide mb-4">
                Contact
              </h3>
              <p className="text-white/70 text-sm mb-1">📞 08027278858</p>
              <p className="text-white/70 text-sm mb-1">
                📞 0706814931, 08054888805
              </p>
              <p className="text-white/70 text-sm">✉️ adebaba27@gmail.com</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gold uppercase tracking-wide mb-4">
                Our Office
              </h3>
              <p className="text-white/70 text-sm">
                Adediran compound, opposite Oke Sunnah junction, along
                Agbooro Road, Saki, Oyo State.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 text-center">
            <p className="text-white/50 text-xs">
              © {new Date().getFullYear()} Priglim by ABC Travels, Logistics
              and Forwarding Nig Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}