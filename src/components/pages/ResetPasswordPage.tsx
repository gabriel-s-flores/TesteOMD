import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { isStrongPassword, isValidEmail } from "../../utils/security";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";

interface ResetPasswordFormData {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>();

  const passwordValue = watch("newPassword");

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    setSuccessMessage(null);

    try {
      await resetPassword({
        email: data.email,
        token: data.token,
        newPassword: data.newPassword,
      });
      setSuccessMessage(t("auth.reset_password.success"));
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("auth.reset_password.errors.generic"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("auth.reset_password.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("auth.reset_password.subtitle")}
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
                  required: t("auth.reset_password.errors.email_required"),
                  validate: (value) =>
                    isValidEmail(value) ||
                    t("auth.reset_password.errors.email_invalid"),
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="token"
              >
                {t("common.labels.token")}
              </label>
              <input
                id="token"
                type="text"
                autoComplete="one-time-code"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border uppercase"
                {...register("token", {
                  required: t("auth.reset_password.errors.token_required"),
                  minLength: {
                    value: 6,
                    message: t("auth.reset_password.errors.token_invalid"),
                  },
                })}
              />
              {errors.token && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.token.message}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="newPassword"
              >
                {t("auth.reset_password.new_password")}
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                {...register("newPassword", {
                  required: t(
                    "auth.reset_password.errors.new_password_required",
                  ),
                  validate: (value) =>
                    isStrongPassword(value) ||
                    t("auth.reset_password.errors.password_weak"),
                })}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="confirmPassword"
              >
                {t("auth.reset_password.confirm_new_password")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                {...register("confirmPassword", {
                  required: t("auth.reset_password.errors.confirm_required"),
                  validate: (value) =>
                    value === passwordValue ||
                    t("auth.reset_password.errors.password_mismatch"),
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {successMessage && (
              <p className="text-sm text-green-700">{successMessage}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {t("common.buttons.reset_password")}
            </Button>

            <div className="text-sm text-center text-gray-600 space-y-1">
              <p>
                <Link
                  className="text-blue-600 hover:underline"
                  to="/forgot-password"
                >
                  {t("auth.reset_password.new_token")}
                </Link>
              </p>
              <p>
                <Link className="text-blue-600 hover:underline" to="/login">
                  {t("auth.reset_password.back_to_login")}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
