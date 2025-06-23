"use client";
import Link from "next/link";
import digitalServiceData from "@/data/digitalServices.json"; // Update path if needed
import { CardSpotlight } from "@/components/ui/card-spotlight";

interface DigitalService {
  id: number;
  title: string;
  description: string;
  slug: string;
  isFeatured: boolean;
}

export default function DigitalServicesPage() {
  const services: DigitalService[] = digitalServiceData.digitalServices;
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start py-12 px-2 sm:px-4 font-sans">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">Digital Services</h1>
        <p className="mt-3 text-neutral-400 max-w-2xl mx-auto">
          Unlock premium features—OCR, image editing, background removal and
          more. Fast, accurate, and secure digital tools for every need!
        </p>
      </div>
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <CardSpotlight
            className="w-96 h-80 relative overflow-visible"
            key={service.id}
          >
            {/* Tag in Top-Right */}
            <span
              className={`absolute top-4 right-4 z-30 text-xs px-2 py-1 rounded font-semibold shadow-lg ${
                service.isFeatured
                  ? "bg-blue-700 text-white"
                  : "bg-neutral-700 text-neutral-200"
              }`}
            >
              {service.isFeatured ? "Featured" : "Standard"}
            </span>
            {/* Card Body */}
            <div className="relative z-20 mt-6 flex flex-col h-full justify-between">
              <div>
                <p className="text-xl font-bold text-white">{service.title}</p>
                <div className="text-neutral-200 mt-4">
                  {service.description}
                </div>
              </div>
              {/* Button at Bottom Center */}
              <div className="w-full flex justify-center mt-8">
                <Link
                  href={`/digitalServices/${service.slug}`}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-base font-semibold shadow"
                >
                  Go to Service
                </Link>
              </div>
            </div>
          </CardSpotlight>
        ))}
      </div>
    </div>
  );
}
