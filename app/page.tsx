import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // ログイン時のみ投稿を取得
  const posts = isLoggedIn 
    ? await prisma.post.findMany({
        orderBy: { id: "desc" },
        include: { author: true },
      })
    : [];

  // 投稿作成用サーバーアクション
  async function addPost(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;

    const title = String(formData.get("title") ?? "");
    const content = String(formData.get("content") ?? "");
    if (!title.trim()) return;

    await prisma.post.create({
      data: {
        title,
        content,
        authorId: Number(session.user.id), // String -> Int 変換
      },
    });
    revalidatePath("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ヘッダー兼ナビゲーション */}
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm sm:px-10">
        <div className="text-xl font-bold text-blue-600">My Auth App</div>
        <nav className="flex items-center gap-4 sm:gap-6">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                ダッシュボード
              </Link>
              <form action={async () => { "use server"; await signOut(); }} className="inline">
                <button type="submit" className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors">
                  ログアウト
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                ログイン
              </Link>
              <Link href="/signup" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                サインアップ
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {isLoggedIn ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            
            {/* 左側：投稿フォーム */}
            <section className="h-fit">
              <h2 className="mb-5 text-lg font-bold text-slate-800">新規投稿</h2>
              <form action={addPost} className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <input 
                  name="title" 
                  placeholder="タイトル" 
                  required 
                  className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none" 
                />
                <textarea 
                  name="content" 
                  placeholder="内容（任意）" 
                  className="w-full min-h-[100px] rounded-md border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none" 
                />
                <button 
                  type="submit" 
                  className="w-full rounded-md bg-blue-600 p-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  投稿する
                </button>
              </form>
            </section>

            {/* 右側：投稿一覧 */}
            <section>
              <h2 className="mb-5 text-lg font-bold text-slate-800">タイムライン</h2>
              <div className="flex flex-col gap-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                      <h3 className="mb-2 text-lg font-bold text-slate-900">{post.title}</h3>
                      <p className="mb-4 text-sm leading-relaxed text-slate-600">{post.content}</p>
                      <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 uppercase font-bold">
                          {post.author?.name?.charAt(0) || "?"}
                        </div>
                        <small className="font-medium text-slate-400 text-xs">by {post.author?.name || "Unknown"}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-10 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">まだ投稿がありません。</p>
                )}
              </div>
            </section>

          </div>
        ) : (
          <div className="mt-20 flex flex-col items-center rounded-2xl bg-white p-12 text-center shadow-xl border border-slate-100 max-w-2xl mx-auto">
            <h1 className="mb-4 text-4xl font-extrabold text-slate-900">ようこそ</h1>
            <p className="mb-8 text-slate-500">投稿の閲覧・作成にはログインが必要です。</p>
            <Link 
              href="/login" 
              className="rounded-lg bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              今すぐログイン
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}