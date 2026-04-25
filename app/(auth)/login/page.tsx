// app/(auth)/login/page.tsx
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

// searchParams を Promise として定義
export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string }> 
}) {
  // ここで await して中身を取り出す
  const params = await searchParams;
  
  const errorMessage = params.error 
    ? "メールアドレスまたはパスワードが正しくありません。" 
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-87.5 space-y-6 rounded-xl bg-white p-8 shadow-md border border-gray-200">
        <h1 className="text-center text-xl font-bold text-gray-800">ログイン</h1>

        {errorMessage && (
          <p className="text-sm font-medium text-red-500 bg-red-50 p-2 rounded border border-red-100">
            {errorMessage}
          </p>
        )}

        <form
          action={async (formData) => {
            "use server";
            try {
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirectTo: "/", 
              });
            } catch (error) {
              if (error instanceof AuthError) {
                // ここでリダイレクト。これで新規メールアドレスでもエラー画面に戻る。
                return redirect(`/login?error=CredentialsSignin`);
              }
              throw error;
            }
          }}
          className="flex flex-col gap-4"
        >
          <input
            name="email"
            type="email"
            placeholder="メールアドレス"
            required
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="パスワード"
            required
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 p-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}