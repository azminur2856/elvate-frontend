"use client";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-white mb-4">Contact Elvate</h1>
        <p className="text-neutral-300 mb-8">
          Have questions, need help, or want to partner with us? We’re always
          happy to hear from you!
        </p>
        <div className="flex flex-col gap-6">
          <ContactItem
            icon={<FaEnvelope className="text-pink-400 text-xl" />}
            label="Email"
            value="support@elvate.com"
            link="mailto:support@elvate.com"
          />
          <ContactItem
            icon={<FaPhone className="text-blue-400 text-xl" />}
            label="Phone"
            value="+880 1234-567890"
            link="tel:+8801234567890"
          />
          <ContactItem
            icon={<FaMapMarkerAlt className="text-green-400 text-xl" />}
            label="Address"
            value="Dhaka, Bangladesh"
          />
        </div>
        <p className="mt-8 text-center text-neutral-400 text-xs">
          Elvate &copy; {new Date().getFullYear()} — We’ll get back to you
          within 24 hours!
        </p>
      </div>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  link?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div>{icon}</div>
      <div>
        <span className="text-neutral-300">{label}:</span>{" "}
        {link ? (
          <a
            href={link}
            className="text-white hover:underline transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        ) : (
          <span className="text-white">{value}</span>
        )}
      </div>
    </div>
  );
}
