"use client";
import React from "react";
import { StickyScroll } from "../ui/sticky-scroll-reveal";

const elvatePlatformContent = [
  {
    title:
      "Transform the Way You Shop and Work Online With ELVATE’s All-in-One Digital Marketplace",
    description:
      "Welcome to ELVATE—the next generation platform where online shopping meets instant digital productivity. Discover a handpicked selection of trending products, gadgets, lifestyle essentials, and exclusive deals, all in one secure marketplace. But that’s not all: ELVATE empowers you with state-of-the-art digital services such as one-click PDF conversion, AI-powered image editing, and smart document tools, designed to save you time and boost your creativity. Whether you’re browsing for new products or enhancing your workflow, ELVATE puts the future of e-commerce and digital tools at your fingertips.",
  },
  {
    title:
      "Experience Lightning-Fast Digital Tools for Everyday Life, From Image Editing to Smart File Conversion",
    description:
      "Stop wasting hours searching for separate apps—ELVATE gives you instant access to powerful digital services right from your browser. Need to extract text from a PDF, resize a profile photo, remove image backgrounds, or convert documents on the fly? Our AI-driven tools deliver results in seconds, with no downloads or technical skills required. Built for busy students, professionals, and creators, ELVATE’s digital suite works 24/7 to help you get more done with less hassle.",
  },
  {
    title:
      "Seamless Shopping and Digital Service Integration—One Account, Endless Possibilities",
    description:
      "Why juggle multiple websites and subscriptions? ELVATE’s unified platform lets you shop for the latest products and access digital tools all in a single, easy-to-use account. Manage your orders, access premium digital features, and enjoy a smooth, consistent experience—whether you’re buying, editing, or creating. Everything you need to power your work and your world is just a click away.",
  },
  {
    title:
      "Unlock Exclusive Benefits and VIP Perks With ELVATE Premium Membership",
    description:
      "Upgrade your experience with ELVATE Premium. Members enjoy special discounts on every purchase, free access or enhanced limits to digital services, priority customer support, and exclusive early-bird access to new features and products. It’s the perfect solution for frequent shoppers, digital entrepreneurs, and anyone who values extra convenience and savings. Join the ELVATE Premium community and get more from every click.",
  },
  {
    title:
      "Your Security, Privacy, and Satisfaction—Guaranteed Every Step of the Way",
    description:
      "At ELVATE, your trust is everything. That’s why we invest in industry-leading security, end-to-end encryption, and transparent privacy policies. Shop confidently with secure payments and fast delivery. Use our digital services knowing your files and data are protected, never shared or sold. Our dedicated team is here to support you, ensuring a safe and satisfying experience from start to finish.",
  },
  {
    title:
      "Constant Innovation: New Products, New Tools, New Opportunities—All For You",
    description:
      "We believe in continuous improvement and customer-driven innovation. ELVATE is always expanding—adding the latest gadgets, must-have accessories, and cutting-edge digital features based on your feedback. Our goal is to be the only online destination you need for shopping and digital solutions. Tell us what you want to see next and help us build the platform of tomorrow.",
  },
];

function WhyChooseUs() {
  return (
    <div>
      <StickyScroll content={elvatePlatformContent} />
    </div>
  );
}

export default WhyChooseUs;
