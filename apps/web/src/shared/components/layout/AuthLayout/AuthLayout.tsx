import AuthBranding from "@/features/auth/components/AuthBranding";
import type { AuthLayoutProps } from "./AuthLayout.types";

export default function AuthLayout({
  children,
  branding,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="flex min-h-screen">

        <div className="hidden lg:block lg:w-[38%]">
          <AuthBranding {...branding} />
        </div>

        <div className="flex flex-1 items-center justify-center px-8">
          <div className="w-full max-w-[430px]">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}









// import AuthBranding from "@/features/auth/components/AuthBranding";
// import type { AuthLayoutProps } from "./AuthLayout.types";

// export default function AuthLayout({
//   children,
//   branding,
// }: AuthLayoutProps) {
//   return (
//     <div className="min-h-screen bg-[var(--color-background)]">
//       <div className="mx-auto flex min-h-screen max-w-7xl">

//         <div className="hidden lg:block lg:w-2/5">
//           <AuthBranding {...branding} />
//         </div>

//         <div className="flex w-full items-center justify-center p-8 lg:w-3/5">
//           {children}
//         </div>

//       </div>
//     </div>
//   );
// }