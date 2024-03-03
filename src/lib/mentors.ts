import { z } from "zod";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import {
  boolean,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { Payload, verify } from "~/lib/token";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { env } from "~/env";
import { relations } from "drizzle-orm/relations";
import { getChannelByName, sendMessage } from "~/lib/discord";

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
  id: z.number().int(),
});

export type MentorPayload = z.infer<typeof mentorSchema>;

async function getMentorById(id: number) {
  try {
    const mentor = await db.query.mentors.findFirst({
      where: eq(mentors.id, id),
      with: { team: true },
    });
    if (!mentor) {
      return null;
    }
    return mentor;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function getTechnologyRoles(technologies: string[]) {
  const rolesWithDuplicates = technologies
    .map((technology) => env.DISCORD_TECHNOLOGY_ROLES_MAP[technology])
    .filter(Boolean);
  return Array.from(new Set(rolesWithDuplicates));
}

export async function decodeMentor(token: string) {
  const res = verify(token);
  if (!res.success) {
    return { success: false } as const;
  }
  const mentorPayload = mentorSchema.safeParse(res.decoded);
  if (!mentorPayload.success) {
    return { success: false } as const;
  }
  const mentor = await getMentorById(mentorPayload.data.id);
  if (!mentor) {
    return { success: false } as const;
  }
  if (mentor.name.length < 1 || mentor.name.length > 32) {
    return {
      success: false,
      error: new Error("name too long or too short"),
    } as const;
  }
  const nick = mentor.name.trim().replaceAll(/ +/g, " ");
  return {
    success: true as const,
    payload: {
      mentor: mentor.id,
      nick,
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

/**
 * Figure out if a mentor has a team role id based on the roles they have
 * @param roles The roles to check
 */
export function hasTeamRole(roles: string[]) {
  return roles.length > 1 && roles[0] !== env.DISCORD_MENTOR_ROLE_ID;
}

export async function saveMentor(params: {
  mentorId: number;
  discordUserId: string;
  hasTeamRole: boolean;
}) {
  try {
    await db
      .update(mentors)
      .set({
        discordUserSnowflake: params.discordUserId,
        hasTeamRole: params.hasTeamRole,
      })
      .where(eq(mentors.id, params.mentorId));
    if (params.hasTeamRole) {
      if (params.discordUserId === "708193374586535936") {
        return;
      }
      const mentor = await getMentorById(params.mentorId);
      if (!mentor?.team?.discordRoleId) {
        return;
      }
      const channel = await getChannelByName(mentor.team.id);
      if (!channel.success) {
        return;
      }
      await sendMessage(
        channel.data.id,
        `⏳ <@&${mentor.team.discordRoleId}>, вашият ментор се присъедини към този канал. <@${params.discordUserId}> и отбор, пожелаваме ви приятна и ползотворна работа в сървъра на Hack TUES X!`,
        [params.discordUserId],
        [mentor.team.discordRoleId],
      );
    }
  } catch (e) {
    // TODO: actual logging
    console.error(e);
  }
}
