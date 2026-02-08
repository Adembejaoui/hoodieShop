"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Loader2 } from "lucide-react";

// Zod validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  className?: string;
  darkMode?: boolean;
}

export function RegisterForm({ className, darkMode = false }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(false);
    setErrors({});
    setGeneralError(null);

    const formData = new FormData(event.currentTarget);
    const data: RegisterFormData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      terms: formData.get("terms") === "on",
    };

    // Validate with Zod
    const result = registerSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const zodError = result.error as z.ZodError<RegisterFormData>;
      zodError.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setGeneralError(responseData.error || "Registration failed. Please try again.");
        return;
      }

      // Registration successful
      router.push("/login?registered=true");
    } catch (error) {
      setGeneralError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = darkMode
    ? "bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-pink-500 focus:ring-pink-500/20"
    : "";

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)}>
      {generalError && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 rounded-md">
          {generalError}
        </div>
      )}

      <Field>
        <FieldLabel className={darkMode ? "text-white/80" : ""}>Full Name</FieldLabel>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          required
          disabled={isLoading}
          className={inputClass}
        />
        {errors.name && <FieldError>{errors.name}</FieldError>}
      </Field>

      <Field>
        <FieldLabel className={darkMode ? "text-white/80" : ""}>Email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="m@example.com"
          required
          disabled={isLoading}
          className={inputClass}
        />
        {errors.email && <FieldError>{errors.email}</FieldError>}
      </Field>

      <Field>
        <FieldLabel className={darkMode ? "text-white/80" : ""}>Password</FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          required
          disabled={isLoading}
          className={inputClass}
        />
        {errors.password && <FieldError>{errors.password}</FieldError>}
      </Field>

      <Field>
        <FieldLabel className={darkMode ? "text-white/80" : ""}>Confirm Password</FieldLabel>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          disabled={isLoading}
          className={inputClass}
        />
        {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
      </Field>

      <Field>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            className={cn(
              "h-4 w-4 rounded border-gray-300",
              darkMode ? "bg-white/5 border-white/30" : ""
            )}
            disabled={isLoading}
          />
          <label htmlFor="terms" className={cn("text-sm", darkMode ? "text-white/70" : "text-muted-foreground")}>
            I agree to the{" "}
            <Link href="/terms" className={cn("underline underline-offset-4", darkMode ? "text-pink-400 hover:text-pink-300" : "")}>
              Terms
            </Link>
          </label>
        </div>
        {errors.terms && <FieldError>{errors.terms}</FieldError>}
      </Field>

      <Field>
        <Button type="submit" disabled={isLoading} className={darkMode ? "w-full" : ""}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </Field>
    </form>
  );
}
