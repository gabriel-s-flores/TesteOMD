import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { isValidEmail } from "../../utils/security";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordPage = () => {
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
      setMessage(
        "Se o e-mail existir, um token de recuperação foi gerado com sucesso.",
      );
      if (result.token) {
        setToken(result.token);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar token.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">Recuperar senha</h1>
          <p className="text-gray-600 mt-1">
            Informe seu e-mail para gerar um token
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                {...register("email", {
                  required: "E-mail é obrigatório",
                  validate: (value) =>
                    isValidEmail(value) || "Formato de e-mail inválido",
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
                  <strong>Token (simulação):</strong> {token}
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
              Gerar token
            </Button>

            <div className="text-sm text-center text-gray-600 space-y-1">
              <p>
                <Link
                  className="text-blue-600 hover:underline"
                  to="/reset-password"
                >
                  Já tem token? Redefinir senha
                </Link>
              </p>
              <p>
                <Link className="text-blue-600 hover:underline" to="/login">
                  Voltar ao login
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
