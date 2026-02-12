import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { isStrongPassword, isValidEmail } from "../../utils/security";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const passwordValue = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      navigate({ to: "/" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("auth.register.errors.generic"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("auth.register.title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("auth.register.subtitle")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="name"
              >
                {t("common.labels.name")}
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                {...register("name", {
                  required: t("auth.register.errors.name_required"),
                  minLength: {
                    value: 2,
                    message: t("auth.register.errors.name_min"),
                  },
                })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

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
                  required: t("auth.register.errors.email_required"),
                  validate: (value) =>
                    isValidEmail(value) ||
                    t("auth.register.errors.email_invalid"),
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
                autoComplete="new-password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                {...register("password", {
                  required: t("auth.register.errors.password_required"),
                  validate: (value) =>
                    isStrongPassword(value) ||
                    t("auth.register.errors.password_weak"),
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="confirmPassword"
              >
                {t("auth.register.confirm_password")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                {...register("confirmPassword", {
                  required: t("auth.register.errors.confirm_required"),
                  validate: (value) =>
                    value === passwordValue ||
                    t("auth.register.errors.password_mismatch"),
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
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
              {t("common.buttons.register")}
            </Button>

            <p className="text-sm text-center text-gray-600">
              {t("auth.register.have_account")}{" "}
              <Link className="text-blue-600 hover:underline" to="/login">
                {t("common.buttons.login")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
