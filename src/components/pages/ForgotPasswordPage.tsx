import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { isValidEmail } from "../../utils/security";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { requestPasswordReset } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setMessage(null);
    setError(null);
    setToken(null);

    try {
      const result = await requestPasswordReset(data.email);
      setMessage(t("auth.forgot_password.success"));
      if (result.token) {
        setToken(result.token);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("auth.forgot_password.errors.generic"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("auth.forgot_password.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("auth.forgot_password.subtitle")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                {t("common.labels.email")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                {...register("email", {
                  required: t("auth.forgot_password.errors.email_required"),
                  validate: (value) =>
                    isValidEmail(value) ||
                    t("auth.forgot_password.errors.email_invalid"),
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {message && <p className="text-sm text-green-700">{message}</p>}
            {token && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>{t("auth.forgot_password.token_simulation")}</strong>{" "}
                  {token}
                </p>
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {t("common.buttons.generate_token")}
            </Button>

            <div className="text-sm text-center text-gray-600 space-y-1">
              <p>
                <Link
                  className="text-blue-600 hover:underline"
                  to="/reset-password"
                >
                  {t("auth.forgot_password.has_token")}
                </Link>
              </p>
              <p>
                <Link className="text-blue-600 hover:underline" to="/login">
                  {t("auth.forgot_password.back_to_login")}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
