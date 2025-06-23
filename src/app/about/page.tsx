"use client";
import { FaRegLightbulb, FaRocket, FaUsers } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-30 px-4">
      <div className="max-w-3xl mx-auto bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-white mb-4">About Elvate</h1>
        <p className="text-neutral-300 mb-6 text-lg">
          <span className="font-semibold text-white">Elvate</span> is your
          all-in-one digital platform offering smart tools and e-commerce
          solutions to empower everyone, from students to professionals and
          small businesses. Our mission is to make powerful digital
          services—like OCR, image editing, background removal, and
          more—accessible, secure, and lightning-fast for everyone.
        </p>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <FeatureCard
            icon={<FaRocket className="text-pink-400 text-3xl" />}
            title="Fast & Powerful"
            description="Experience blazing-fast performance and industry-grade technology with every tool."
          />
          <FeatureCard
            icon={<FaRegLightbulb className="text-yellow-300 text-3xl" />}
            title="Innovative Services"
            description="From image editing to advanced OCR and e-commerce features, Elvate stays ahead."
          />
          <FeatureCard
            icon={<FaUsers className="text-blue-400 text-3xl" />}
            title="For Everyone"
            description="Elvate is designed for individuals, creators, and businesses of all sizes."
          />
        </div>
        <p className="text-neutral-400 text-center text-sm">
          Built in Bangladesh • Powered by passion for technology and
          simplicity.
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex-1 bg-neutral-800 rounded-xl p-4 flex flex-col items-center shadow-md border border-neutral-700">
      {icon}
      <h2 className="text-white font-semibold text-lg mt-3 mb-1">{title}</h2>
      <p className="text-neutral-400 text-center text-sm">{description}</p>
    </div>
  );
}
