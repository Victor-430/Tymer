"use client";

import { getIn, type FormikProps, type FormikValues } from "formik";
import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";

type FormFieldProps<T extends FormikValues> = Omit<ComponentProps<typeof Input>, "name" | "id" | "value" | "onChange" | "onBlur"> & {
  name: Extract<keyof T, string>;
  label: string;
  formik: Pick<FormikProps<T>, "getFieldProps" | "errors" | "touched">;
  endAdornment?: ReactNode;
};

export function FormField<T extends FormikValues>({ name, label, formik, endAdornment, className, ...props }: FormFieldProps<T>) {
  const fieldError: unknown = getIn(formik.errors, name);
  const error = getIn(formik.touched, name) && typeof fieldError === "string" ? fieldError : undefined;
  return <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-medium">{label}</label>
    <div className="relative">
      <Input {...props} {...formik.getFieldProps(name)} id={name} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined}
        className={`h-12 rounded-xl border-border bg-background px-3.5 ${endAdornment ? "pr-12" : ""} ${className ?? ""}`} />
      {endAdornment}
    </div>
    {error && <p id={`${name}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
