// import Link from "next/link";
// //import { Spotlight } from "./ui/Spotlight";
// import { Button } from "../ui/moving-border";
// import { Spotlight } from "../ui/spotlight-new";

// function HeroSection() {
//   return (
//     <div className="h-auto md:h-[40rem] w-full rounded-md flex flex-col items-center justify-center relative overflow-hidden mx-auto py-10 md:py-0">
//       {/* <Spotlight
//         className="-top-40 left-0 md:left-60 md:-top-20"
//         fill="white"
//       /> */}

//       <Spotlight />
//       <div className="p-4 relative z-10 w-full text-center">
//         <h1 className="mt-20 md:mt-0 text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
//           Master the art of music
//         </h1>
//         <p className="mt-4 font-normal text-base md:text-lg text-neutral-300 max-w-lg mx-auto">
//           Dive into our comprehensive music courses and transform your musical
//           journey today. Whether you're a beginner or looking to refine your
//           skills, join us to unlock your true potential.
//         </p>
//         <div className="mt-4">
//           <Link href={"/courses"}>
//             <Button
//               borderRadius="1.75rem"
//               className="bg-white dark:bg-black text-black dark:text-white border-neutral-200 dark:border-slate-800"
//             >
//               Explore courses
//             </Button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default HeroSection;

import Link from "next/link";
import { Button } from "../ui/moving-border";
import { Spotlight } from "../ui/spotlight-new";

function HeroSection() {
  return (
    <div className="h-auto md:h-[40rem] w-full rounded-md flex flex-col items-center justify-center relative overflow-hidden mx-auto py-10 md:py-0">
      <Spotlight />
      <div className="p-4 relative z-10 w-full text-center">
        <h1 className="mt-20 md:mt-0 text-4xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
          Elevate Your Digital Experience
        </h1>
        <p className="mt-4 font-normal text-base md:text-lg text-neutral-300 max-w-2xl mx-auto">
          Welcome to <span className="font-semibold text-white">Elvate</span> —
          your all-in-one platform for digital services and smart shopping.
          Instantly convert PDFs, edit images, remove backgrounds, or resize
          files with a click. Plus, discover and shop high-quality products
          delivered right to your door.
        </p>
        <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
          <Link href="/digitalServices">
            <Button
              borderRadius="1.75rem"
              className="bg-white dark:bg-black text-black dark:text-white border-neutral-200 dark:border-slate-800"
            >
              Explore Digital Services
            </Button>
          </Link>
          <Link href="/shop">
            <Button
              borderRadius="1.75rem"
              className="bg-white dark:bg-black text-black dark:text-white border-neutral-200 dark:border-slate-800"
            >
              Shop Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
