import { relations } from "drizzle-orm/relations";
import { users, documents, universities, programs, universityData, enrollmentStageHistory, notifications, installmentObservations, profiles, payments, installments, requests } from "./schema";

export const documentsRelations = relations(documents, ({one}) => ({
	user: one(users, {
		fields: [documents.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	documents: many(documents),
	universityData: many(universityData),
	enrollmentStageHistories_userId: many(enrollmentStageHistory, {
		relationName: "enrollmentStageHistory_userId_users_id"
	}),
	enrollmentStageHistories_changedBy: many(enrollmentStageHistory, {
		relationName: "enrollmentStageHistory_changedBy_users_id"
	}),
	notifications: many(notifications),
	installmentObservations: many(installmentObservations),
	profiles: many(profiles),
	payments: many(payments),
	requests: many(requests),
	installments: many(installments),
}));

export const programsRelations = relations(programs, ({one, many}) => ({
	university: one(universities, {
		fields: [programs.universityId],
		references: [universities.id]
	}),
	universityData: many(universityData),
}));

export const universitiesRelations = relations(universities, ({many}) => ({
	programs: many(programs),
	universityData: many(universityData),
}));

export const universityDataRelations = relations(universityData, ({one}) => ({
	user: one(users, {
		fields: [universityData.userId],
		references: [users.id]
	}),
	university: one(universities, {
		fields: [universityData.universityId],
		references: [universities.id]
	}),
	program: one(programs, {
		fields: [universityData.programId],
		references: [programs.id]
	}),
}));

export const enrollmentStageHistoryRelations = relations(enrollmentStageHistory, ({one}) => ({
	user_userId: one(users, {
		fields: [enrollmentStageHistory.userId],
		references: [users.id],
		relationName: "enrollmentStageHistory_userId_users_id"
	}),
	user_changedBy: one(users, {
		fields: [enrollmentStageHistory.changedBy],
		references: [users.id],
		relationName: "enrollmentStageHistory_changedBy_users_id"
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const installmentObservationsRelations = relations(installmentObservations, ({one}) => ({
	user: one(users, {
		fields: [installmentObservations.userId],
		references: [users.id]
	}),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	user: one(users, {
		fields: [profiles.userId],
		references: [users.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	user: one(users, {
		fields: [payments.userId],
		references: [users.id]
	}),
	installment: one(installments, {
		fields: [payments.installmentId],
		references: [installments.id]
	}),
}));

export const installmentsRelations = relations(installments, ({one, many}) => ({
	payments: many(payments),
	user: one(users, {
		fields: [installments.userId],
		references: [users.id]
	}),
}));

export const requestsRelations = relations(requests, ({one}) => ({
	user: one(users, {
		fields: [requests.userId],
		references: [users.id]
	}),
}));