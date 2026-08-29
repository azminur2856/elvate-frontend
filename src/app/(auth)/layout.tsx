import type { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-[calc(100svh-var(--navbar-h))] items-center justify-center px-4 py-10">
      {children}
    </div>
  );
}
