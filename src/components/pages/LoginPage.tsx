import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { isValidEmail } from "../../utils/security";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data);
      navigate({ to: "/" });
    } catch {
      setError(t("auth.login.errors.invalid_credentials"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("auth.login.title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("auth.login.subtitle")}</p>
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
                autoComplete="username"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                {...register("email", {
                  required: t("auth.login.errors.email_required"),
                  validate: (value) =>
                    isValidEmail(value) || t("auth.login.errors.email_invalid"),
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
                htmlFor="password"
              >
                {t("common.labels.password")}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                {...register("password", {
                  required: t("auth.login.errors.password_required"),
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {t("common.buttons.login")}
            </Button>

            <div className="text-sm text-center text-gray-600 space-y-1">
              <p>
                {t("auth.login.no_account")}{" "}
                <Link className="text-blue-600 hover:underline" to="/register">
                  {t("auth.login.create_account")}
                </Link>
              </p>
              <p>
                <Link
                  className="text-blue-600 hover:underline"
                  to="/forgot-password"
                >
                  {t("auth.login.forgot_password")}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
