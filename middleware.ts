import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Prismaを読み込んでいる auth.ts をインポートしないようにする
export function middleware(request: NextRequest) {
  // 認証チェックをしたい場合は、ここではCookieの存在確認などに留める
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}