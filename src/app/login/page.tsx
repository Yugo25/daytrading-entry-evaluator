import { login } from "./actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/journal";
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <form action={login} className="card space-y-4">
        <h1 className="text-lg font-semibold">ログイン</h1>
        {sp.error && <p className="text-sm text-red-500">パスワードが違います</p>}
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label">パスワード</label>
          <input className="input" type="password" name="password" autoFocus />
        </div>
        <button className="btn-primary w-full">入る</button>
      </form>
    </div>
  );
}
