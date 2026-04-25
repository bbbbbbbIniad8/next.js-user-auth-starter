import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

// 1. searchParams を Promise 型に変更
export default async function SignupPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string }> 
}) {
  // 2. await して中身を取り出す
  const params = await searchParams;

  // URLのクエリパラメータからエラーメッセージを判定
  const errorMessage = params.error === "UserExists" 
    ? "このメールアドレスは既に登録されています" 
    : params.error === "SomethingWentWrong"
    ? "予期せぬエラーが発生しました"
    : null;

  async function register(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      // 既存ユーザー確認
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return redirect("/signup?error=UserExists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      // 登録成功
      return redirect("/login");
    } catch (error: unknown) {
      // redirect() による内部エラーはそのまま throw する必要がある
      // Next.js の仕様上、catch しても throw し直さないとリダイレクトが機能しません
      throw error;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-87.5 space-y-6 rounded-xl bg-white p-8 shadow-md border border-gray-200">
        <h2 className="text-center text-xl font-bold text-gray-800">サインアップ</h2>
        
        {errorMessage && (
          <p className="text-sm font-medium text-red-500 bg-red-50 p-2 rounded border border-red-100">
            {errorMessage}
          </p>
        )}
        
        <form action={register} className="flex flex-col gap-4">
          <input 
            name="name" 
            placeholder="名前" 
            required 
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none" 
          />
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
            登録する
          </button>
        </form>
      </div>
    </div>
  );
}