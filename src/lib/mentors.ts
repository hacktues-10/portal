import { z } from "zod";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { Payload, verify } from "~/lib/token";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { env } from "~/env";
import { relations } from "drizzle-orm/relations";

const mentors = pgTable("mentors", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name"),
  name: varchar("name").notNull(),
  fileName: varchar("file_name").default("").notNull(),
  description: varchar("description").notNull(),
  technologies: varchar("technologies").notNull(),
  jobPosition: varchar("job_position").notNull(),
  tuesVispusk: varchar("tues_vispusk"),
  schedule: varchar("schedule"),
  where: varchar("where"),
  discordUserSnowflake: varchar("discord_user_snowflake"),
  hasTeamRole: boolean("has_team_role").notNull().default(false),
});

const teams = pgTable("teams", {
  id: varchar("id").primaryKey(),
  mentorId: integer("mentor_id").references(() => mentors.id),
  discordRoleId: varchar("role_id"),
});

const teamsRelations = relations(teams, ({ one }) => ({
  mentor: one(mentors, {
    fields: [teams.mentorId],
    references: [mentors.id],
  }),
}));

const mentorsRelations = relations(mentors, ({ one }) => ({
  team: one(teams),
}));

const db = drizzle(sql, {
  schema: { teams, mentors, teamsRelations, mentorsRelations },
});

const mentorSchema = z.object({
  m: z.number().int(),
});

async function getMentorById(id: number) {
  const mentor = await db.query.mentors.findFirst({
    where: eq(mentors.id, id),
    with: { team: true },
  });
  if (!mentor) {
    return null;
  }
  return mentor;
}

function getTechnologyRoles(technologies: string[]) {
  return [];
}

export async function decodeMentor(token: string) {
  const res = verify(token);
  if (!res.success) {
    return res;
  }
  const mentorPayload = mentorSchema.safeParse(res.decoded);
  if (!mentorPayload.success) {
    return { success: false } as const;
  }
  const mentor = await getMentorById(mentorPayload.data.m);
  if (!mentor) {
    return { success: false } as const;
  }
  if (mentor.name.length < 1 || mentor.name.length > 32) {
    return {
      success: false,
      error: new Error("name too long or too short"),
    } as const;
  }
  return {
    success: true,
    payload: {
      nick: mentor.name,
      roles: [
        ...(mentor.team?.discordRoleId ? [mentor.team.discordRoleId] : []),
        env.DISCORD_MENTOR_ROLE_ID,
        ...getTechnologyRoles(mentor.technologies.split(", ")),
      ],
      ...(env.DISCORD_MENTOR_JOIN_CHANNEL_ID
        ? { entry: env.DISCORD_MENTOR_JOIN_CHANNEL_ID }
        : {}),
    } satisfies Payload,
  };
}
