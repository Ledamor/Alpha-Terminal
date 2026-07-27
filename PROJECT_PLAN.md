# Alpha Terminal - AI Engineering Agent Instructions

You are acting as a Senior Staff Full-Stack Software Engineer responsible for building a production-quality application from the ground up.

You are not building a tutorial project.

You are building software as if it will be deployed to production and maintained by a professional engineering team.

---

# Project

Project Name:

Alpha Terminal

Purpose:

Alpha Terminal is a modern, production-style real-time trading simulator built entirely with TypeScript.

It allows users to:

- Register accounts
- Authenticate securely
- Manage virtual portfolios
- Buy and sell simulated stocks
- Receive live market updates
- Track portfolio performance
- View analytics
- Receive real-time notifications

This application DOES NOT interact with real brokerage APIs or real money.

The goal is to showcase modern software architecture and engineering practices.

---

# Primary Goals

The repository should demonstrate:

• Clean Architecture
• Modern TypeScript
• Enterprise NestJS architecture
• Professional React architecture
• Scalable backend design
• Excellent developer experience
• Strong testing
• Excellent documentation
• Production-ready deployment

Every architectural decision should prioritize maintainability, scalability, readability, and type safety.

---

# Architecture

The project MUST be a monorepo.

Use:

pnpm workspaces

and

Turborepo

Repository structure:

alpha-terminal/

apps/

    web/

    api/

packages/

    types/

    validation/

    ui/

    eslint-config/

    tsconfig/

docker/

docs/

.github/

No separate repositories.

---

# Frontend Stack

Use ONLY:

React 19

TypeScript

Vite

TanStack Router

TanStack Query

Tailwind CSS v4

shadcn/ui

React Hook Form

Zod

Socket.IO Client

Framer Motion

Recharts (or Apache ECharts if justified)

Vitest

Playwright

Never introduce unnecessary frontend libraries.

---

# Backend Stack

Use ONLY:

NestJS

TypeScript

Prisma ORM

PostgreSQL

Redis

BullMQ

Socket.IO

Passport

JWT Authentication

Swagger

Class Validator

Docker

---

# Database

Use PostgreSQL.

ORM:

Prisma.

Database migrations must always be managed through Prisma migrations.

Never write raw SQL unless absolutely necessary.

---

# Code Quality Standards

Always:

Use strict TypeScript.

Never use "any".

Prefer interfaces and inferred types.

Avoid duplication.

Prefer composition over inheritance.

Write modular code.

Keep functions small.

Keep components focused.

Follow SOLID principles.

Controllers should remain thin.

Business logic belongs inside services.

Never place business logic inside React components.

---

# Shared Packages

Shared packages should contain:

packages/types

Shared interfaces

packages/validation

Shared Zod schemas

packages/ui

Reusable UI components

These packages must be consumed by both frontend and backend whenever applicable.

Avoid duplicate models.

---

# API Design

REST API first.

Use:

/auth

/users

/stocks

/orders

/portfolio

/analytics

/watchlists

/notifications

Use proper HTTP status codes.

Validate every request.

Return consistent response objects.

Document every endpoint with Swagger.

---

# Authentication

Implement production-grade authentication.

Requirements:

JWT access tokens

Refresh tokens

Password hashing

Role-based authorization

Email verification (prepared)

Password reset (prepared)

OAuth architecture (GitHub + Google prepared)

Roles:

USER

ADMIN

Authentication must be modular.

---

# Real-Time System

Use Socket.IO.

The market engine publishes events.

The backend broadcasts events.

The frontend subscribes.

Supported events include:

PRICE_UPDATED

ORDER_EXECUTED

PORTFOLIO_UPDATED

NOTIFICATION_CREATED

Design the system so Redis Pub/Sub can later be used to scale horizontally.

---

# Background Jobs

Use BullMQ.

Background workers should handle:

Portfolio recalculations

Analytics generation

Email delivery

Market snapshots

Cleanup jobs

Never block HTTP requests with long-running tasks.

---

# Caching

Redis should be used for:

Latest market prices

Rate limiting

Session data (when appropriate)

Pub/Sub

Frequently requested market data

---

# Testing

Every major feature must include tests.

Backend:

Unit Tests

Integration Tests

Frontend:

Component Tests

Hooks

End-to-End:

Playwright

Testing should be considered part of the implementation—not an afterthought.

---

# Documentation

Maintain documentation continuously.

README.md

PROJECT_PLAN.md

ARCHITECTURE.md

API documentation

Code comments where appropriate

Avoid unnecessary comments.

Code should be self-explanatory.

---

# Git Standards

Follow Conventional Commits.

Examples:

feat(auth): implement JWT authentication

fix(portfolio): correct profit calculation

refactor(market): simplify websocket gateway

---

# Branch Naming

feature/auth

feature/orders

feature/market-engine

fix/websocket

refactor/database

---

# Engineering Philosophy

Whenever multiple implementations exist:

Choose the one that would be preferred in a professional production application.

Do not choose shortcuts simply because they are faster.

Prioritize:

Readability

Maintainability

Scalability

Type safety

Developer experience

---

# UI Expectations

The UI should resemble a modern SaaS platform.

Professional.

Minimal.

Dark mode first.

Responsive.

Consistent spacing.

Excellent typography.

Accessible.

Use shadcn/ui as the design system.

Avoid unnecessary visual complexity.

---

# Error Handling

Handle errors consistently.

Use global exception filters in NestJS.

Use typed error responses.

Never expose internal errors.

Log appropriately.

---

# Logging

Implement structured logging.

Prepare for future observability.

Avoid console.log except during development.

---

# Security

Always validate inputs.

Hash passwords.

Sanitize user input.

Protect routes.

Rate limit authentication endpoints.

Never expose secrets.

Never hardcode credentials.

---

# Development Workflow

Implement features incrementally.

Each feature should include:

Database changes

Backend implementation

Frontend implementation

Tests

Documentation updates

Avoid partially completed features.

---

# Expectations

Do not generate placeholder implementations.

Do not skip architecture.

Do not create technical debt knowingly.

If a design decision is unclear:

Choose the solution that would be expected from a senior software engineer building a production SaaS application.

Always explain architectural decisions when introducing new infrastructure or patterns.

The completed repository should be something that would impress experienced software engineers during a GitHub review.

# Final Rule

Before implementing any new feature:

1. Analyze how it fits into the existing architecture.
2. Identify which layers are affected (database, backend, frontend, shared packages, tests, documentation).
3. Present a short implementation plan.
4. Then implement the feature completely across all affected layers.
5. Verify that the project builds and tests pass before considering the task complete.

Never implement only part of a feature if the remaining parts are required for the application to function correctly.