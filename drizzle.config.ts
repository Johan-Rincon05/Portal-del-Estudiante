import { defineConfig } from "drizzle-kit";

// Comentamos la verificación de la variable de entorno
// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL, ensure the database is provisioned");
// }

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // Usamos directamente la URL de la base de datos
    url: "postgresql://postgres:postgres@localhost:5432/portal_estudiante",
  },
});
