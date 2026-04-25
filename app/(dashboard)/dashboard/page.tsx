import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  // 1. 未ログインならログイン画面へ強制送還
  if (!session?.user) {
    redirect("/login");
  }

  // 2. 自分の投稿だけをDBから取得
  const myPosts = await prisma.post.findMany({
    where: {
      authorId: Number(session.user.id),
    },
    orderBy: {
      id: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* ヘッダー */}
        <header className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <Link href="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors">
              <span>←</span> ホームに戻る
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">マイ・ダッシュボード</h1>
          </div>
          <form action={async () => { "use server"; await signOut(); }}>
            <button 
              type="submit" 
              className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 transition-colors"
            >
              ログアウト
            </button>
          </form>
        </header>

        <main className="grid gap-8 flex-col">
          {/* ユーザー情報カード */}
          <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              ユーザー情報
            </h2>
            <div className="grid gap-2 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-800">名前:</span> {session.user.name}</p>
              <p><span className="font-semibold text-slate-800">メール:</span> {session.user.email}</p>
              <p><span className="font-semibold text-slate-800">ユーザーID (DB):</span> {session.user.id}</p>
            </div>
          </section>

          {/* 投稿一覧 */}
          <section>
            <h2 className="mb-6 text-xl font-bold text-slate-800">
              あなたの投稿一覧 <span className="ml-2 text-sm font-normal text-slate-500">({myPosts.length}件)</span>
            </h2>
            
            {myPosts.length > 0 ? (
              <div className="grid gap-4">
                {myPosts.map((post) => (
                  <div key={post.id} className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-500 border border-slate-200">
                        ID: {post.id}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">{post.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 px-4 text-center">
                <p className="mb-4 text-slate-500">まだ投稿がありません。</p>
                <Link 
                  href="/" 
                  className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95"
                >
                  最初の投稿を作成する
                </Link>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}