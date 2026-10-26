// 見ている人のロールと、**実データの面数**から見せ方を決める。
//
// 面数の出所は content.ts の作り物（TODAY_PAPERS）だった。いまは机が読んだ面タグの実数を
// 渡す。まだ読めていないときは面数を言わない（「全 9 面」と言い切らない）。

export type Role = "author" | "editor" | "admin";

export type RoleView = {
  role: Role;
  label: string;
  scopeNote: string;
  canPublish: boolean;
};

type RoleLike = { name?: string } | string;

const ADMIN_ROLES = ["Owner", "Administrator", "Super Editor"];

/**
 * @param roles セッションのロール
 * @param faceCount 机が読んだ面タグの数。まだ読めていなければ null
 */
export function roleOf(roles: RoleLike[] | undefined | null, faceCount: number | null): RoleView {
  const names = (roles ?? []).map((role) => (typeof role === "string" ? role : String(role.name ?? "")));
  const all = faceCount === null ? "面の数は取れていません" : `全 ${faceCount} 面`;

  if (names.some((name) => ADMIN_ROLES.includes(name))) {
    return { role: "admin", label: "管理者", scopeNote: `${all}と運用の状態`, canPublish: true };
  }
  if (names.some((name) => name === "Editor")) {
    return { role: "editor", label: "編集者", scopeNote: `${all}と締切`, canPublish: true };
  }
  return { role: "author", label: "記者", scopeNote: "自分の担当面の入稿", canPublish: false };
}
