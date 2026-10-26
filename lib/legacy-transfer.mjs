// Administrator-only helper. Never import into a browser or public API route.
export function assignLegacy(sql, ownerId) {
 return sql.transaction([
  sql`LOCK TABLE plans,thought_topics,user_categories,plan_categories IN SHARE ROW EXCLUSIVE MODE`,
  sql`INSERT INTO user_categories(owner_id,name) SELECT ${ownerId}::uuid, name FROM plan_categories ON CONFLICT DO NOTHING`,
  sql`INSERT INTO user_categories(owner_id,name) SELECT DISTINCT ${ownerId}::uuid,category FROM plans WHERE owner_id IS NULL AND category IS NOT NULL ON CONFLICT DO NOTHING`,
  sql`UPDATE plans SET owner_id=${ownerId} WHERE owner_id IS NULL RETURNING id`,
  sql`UPDATE thought_topics SET owner_id=${ownerId} WHERE owner_id IS NULL RETURNING id`,
  sql`DELETE FROM plan_categories`
 ]);
}
