import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { invoices } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const payments = await db.query.invoices.findMany({
      where: eq(invoices.userId, user.id),
      orderBy: [desc(invoices.createdTime)],
      limit: limit,
      offset: offset,
    });

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.userId, user.id));

    return NextResponse.json({
      payments,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar histórico de pagamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico de pagamentos" },
      { status: 500 }
    );
  }
} 