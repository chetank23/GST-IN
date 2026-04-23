"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppFrame } from "@/components/ui/AppFrame";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";

const onboardingSchema = z.object({
  businessName: z.string().min(2, "Enter business name"),
  ownerName: z.string().min(2, "Enter owner name"),
  gstin: z.string().min(15, "GSTIN should be 15 characters").max(15),
  state: z.string().min(2, "Select state"),
  invoicePrefix: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const setBusinessProfile = useAppStore((state) => state.setBusinessProfile);
  const businessProfile = useAppStore((state) => state.businessProfile);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: businessProfile.businessName,
      gstin: businessProfile.gstin,
      state: businessProfile.state,
      whatsappNumber: businessProfile.whatsappNumber,
    },
  });

  const onSubmit = (values: OnboardingValues) => {
    setBusinessProfile({
      businessName: values.businessName,
      gstin: values.gstin,
      state: values.state,
      whatsappNumber: values.whatsappNumber ?? "",
    });
    router.push("/");
  };

  return (
    <AppFrame>
      <section className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-4">
        <h1 className="font-display text-xl font-bold">Business Setup</h1>
        <p className="text-sm text-muted">Step 1 of 3</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <input {...register("businessName")} placeholder="Business name" className="h-12 w-full rounded-xl border border-line px-3" />
          {errors.businessName ? <p className="text-xs text-danger">{errors.businessName.message}</p> : null}
          <input {...register("ownerName")} placeholder="Owner name" className="h-12 w-full rounded-xl border border-line px-3" />
          <input {...register("gstin")} placeholder="GSTIN (15 characters)" className="h-12 w-full rounded-xl border border-line px-3" />
          {errors.gstin ? <p className="text-xs text-danger">{errors.gstin.message}</p> : null}
          <input {...register("state")} placeholder="State (e.g. KA, MH, TN)" className="h-12 w-full rounded-xl border border-line px-3" />
          <input {...register("whatsappNumber")} placeholder="WhatsApp number (optional)" className="h-12 w-full rounded-xl border border-line px-3" />
          <input {...register("invoicePrefix")} placeholder="Invoice prefix (optional, e.g. INV)" className="h-12 w-full rounded-xl border border-line px-3" />
          <div className="flex gap-2 pt-2">
            <SecondaryButton type="button" onClick={() => router.push("/")}>Finish later</SecondaryButton>
            <PrimaryButton type="submit">Save and Continue</PrimaryButton>
          </div>
        </form>
      </section>
    </AppFrame>
  );
}

