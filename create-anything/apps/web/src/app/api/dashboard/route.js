import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function GET() {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Ouvert') as open,
        COUNT(*) FILTER (WHERE severity = 'Critique') as critical,
        COUNT(*) FILTER (WHERE status = 'Clos') as closed
      FROM non_conformities
    `;

    const recentNc = await sql`
      SELECT n.*, u.username as declarant_name
      FROM non_conformities n
      LEFT JOIN users u ON n.declared_by = u.id
      ORDER BY n.date_nc DESC
      LIMIT 5
    `;

    return Response.json({ stats: stats[0], recentNc });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
