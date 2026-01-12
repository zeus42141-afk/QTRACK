import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";

export async function GET() {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const ncList = await sql`
      SELECT n.*, u.username as declarant_name
      FROM non_conformities n
      LEFT JOIN users u ON n.declared_by = u.id
      ORDER BY n.date_nc DESC
    `;
    return Response.json(ncList);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { defect_type, workstation, severity, description } =
      await req.json();

    // Get user internal ID from auth_users or users table
    const userResult =
      await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    let userId = userResult[0]?.id;

    // If user doesn't exist in our app's users table yet, sync them
    if (!userId) {
      const newUser = await sql`
        INSERT INTO users (username, email, role)
        VALUES (${session.user.name || session.user.email.split("@")[0]}, ${session.user.email}, 'User')
        RETURNING id
      `;
      userId = newUser[0].id;
    }

    const result = await sql`
      INSERT INTO non_conformities (defect_type, workstation, severity, description, declared_by)
      VALUES (${defect_type}, ${workstation}, ${severity}, ${description}, ${userId})
      RETURNING *
    `;

    const newNc = result[0];

    // Envoyer un email si la NC est critique
    if (severity === "Critique") {
      try {
        // Récupérer les emails des responsables qualité (role = 'Admin' ou 'Quality Manager')
        const qualityManagers = await sql`
          SELECT DISTINCT u.email 
          FROM users u 
          WHERE u.role IN ('Admin', 'Quality Manager') AND u.email IS NOT NULL
        `;

        const recipients = qualityManagers.map((qm) => qm.email);

        if (recipients.length > 0) {
          await sendEmail({
            to: recipients,
            subject: `[Q-TRACK] 🚨 Non-Conformité CRITIQUE déclarée - NC #${newNc.id}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #E74C3C; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin: 0;">🚨 Non-Conformité CRITIQUE</h2>
                </div>
                <div style="background: white; padding: 20px; border: 1px solid #E0E0E0; border-top: none;">
                  <p>Une nouvelle non-conformité <strong>CRITIQUE</strong> a été déclarée :</p>
                  <div style="background: #FFF3CD; padding: 15px; border-left: 4px solid #E74C3C; margin: 20px 0;">
                    <p><strong>NC #${newNc.id}</strong></p>
                    <p><strong>Type:</strong> ${defect_type}</p>
                    <p><strong>Poste:</strong> ${workstation}</p>
                    <p><strong>Description:</strong> ${description || "Non spécifiée"}</p>
                    <p><strong>Date:</strong> ${new Date(newNc.date_nc).toLocaleString("fr-FR")}</p>
                  </div>
                  <p style="color: #E74C3C; font-weight: bold;">⚠️ Action immédiate requise</p>
                  <p style="color: #7F8C8D; font-size: 12px; margin-top: 30px;">
                    Cet email a été envoyé automatiquement par Q-TRACK
                  </p>
                </div>
              </div>
            `,
            text: `Non-Conformité CRITIQUE déclarée - NC #${newNc.id}\n\nType: ${defect_type}\nPoste: ${workstation}\nDescription: ${description || "Non spécifiée"}\n\n⚠️ Action immédiate requise`,
          });
        }
      } catch (emailError) {
        console.error(
          "Email not sent (API key may be missing):",
          emailError.message,
        );
        // Continue même si l'email échoue
      }
    }

    return Response.json(newNc);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
