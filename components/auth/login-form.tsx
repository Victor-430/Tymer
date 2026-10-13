"use client";

import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginValues } from "@/schema/login.schema";
import { useLoginMutation } from "@/service/api/auth.api";
import { getApiError } from "@/service/httpclient/errors";
import { setCredentials } from "@/slice/auth.slice";
import { useAppDispatch } from "@/store/hooks";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const dispatch = useAppDispatch();
  const [login, { reset, isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const submitting = useRef(false);
  const activeRequest = useRef<ReturnType<typeof login> | null>(null);

  useEffect(() => () => { activeRequest.current?.abort(); }, []);

  const formik = useFormik<LoginValues>({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, helpers) => {
      if (submitting.current) return;
      submitting.current = true;
      helpers.setStatus(undefined);
      try {
        const credentials = await loginSchema.validate(values, { abortEarly: false });
        const request = login(credentials);
        activeRequest.current = request;
        const response = await request.unwrap();
        const data = response.data;
        if (typeof data?.access_token !== "string" || !data.access_token.trim()
          || !data.employee || typeof data.employee.employee_id !== "number" || data.employee.employee_id <= 0) {
          throw new Error("The server returned invalid login data. Please try again.");
        }
        dispatch(setCredentials(data));
        helpers.resetForm();
      } catch (error) {
        const { message, fieldErrors } = getApiError(error);
        helpers.setStatus(message);
        for (const [field, fieldMessage] of Object.entries(fieldErrors)) {
          helpers.setFieldError(field, fieldMessage);
          await helpers.setFieldTouched(field, true, false);
        }
      } finally {
        activeRequest.current = null;
        submitting.current = false;
        helpers.setSubmitting(false);
        // Remove credentials and tokens from the mutation's retained result.
        reset();
      }
    },
  });

  const pending = formik.isSubmitting || isLoading;

  return <form noValidate onSubmit={formik.handleSubmit} aria-label="Admin login" aria-busy={pending} className="space-y-5">
    {typeof formik.status === "string" && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{formik.status}</div>}
    <FormField name="email" label="Email address" type="email" placeholder="you@company.com" autoComplete="username" autoCapitalize="none" spellCheck={false} disabled={pending} formik={formik} />
    <FormField name="password" label="Password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" disabled={pending} formik={formik}
      endAdornment={<button type="button" onClick={() => setShowPassword((shown) => !shown)} disabled={pending}
        aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
        {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
      </button>} />
    <Button type="submit" disabled={pending} className="mt-2 w-full">
      {pending ? <><Loader2 aria-hidden="true" className="size-4 animate-spin" />Signing in…</> : <>Sign in<ArrowRight aria-hidden="true" className="size-4" /></>}
    </Button>
  </form>;
}
