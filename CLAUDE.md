# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Fitness Trainer - A Next.js application that provides personalized AI-powered fitness coaching using OpenAI's GPT models.

## Build and Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

- **Framework**: Next.js 16 with App Router, TypeScript, Tailwind CSS v4
- **AI Integration**: OpenAI API (server-side only for security)

### Key Files

- `src/app/api/chat/route.ts` - API route handling OpenAI requests (keeps API key server-side)
- `src/components/ChatInterface.tsx` - Main chat UI component
- `src/lib/openai.ts` - OpenAI client configuration and system prompt

### Security Pattern

All OpenAI API calls happen server-side through `/api/chat`. The client never accesses the API key directly.

## Environment Variables

Copy `.env.example` to `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=your_key_here
```
