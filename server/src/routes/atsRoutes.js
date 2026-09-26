import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import { prisma } from '../../lib/prisma.js';

import {
  getDbUserFromAuth,
  validateUserAccess,
  validateResumeOwnership,
} from './../utils/authHelper.js';
import { analyzeResume } from '../../services/aiService.js';

const router = express.Router();

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { selectedResumeId_ATS, jobLink_ATS } = req.body;

    const dbUser = await getDbUserFromAuth(req, prisma);

    if (!dbUser) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (!selectedResumeId_ATS || !jobLink_ATS?.trim()) {
      return res.status(400).json({
        message: 'selectedResumeId and jobLink are required',
      });
    }

    const resume = await prisma.resume.findUnique({
      where: {
        id: selectedResumeId_ATS,
      },
      include: {
        experiences: {
          include: {
            bullets: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        skillGroups: {
          include: {
            items: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found',
      });
    }

    if (resume.userId !== dbUser.id) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }

    const score = await analyzeResume({ resume, jobLink_ATS });

    // const score = {
    //   score: 85,
    //   summary:
    //     'Strong frontend-focused profile with React, Next.js, and TypeScript that likely aligns with a Frontend/Software Engineer role. Demonstrated experience building scalable, accessible UI and collaborating cross-functionally. Gaps include missing explicit testing/QA tooling, cloud experience, GraphQL, and domain alignment with HR/payroll/fintech. Resume clarity is impacted by repeated and one incomplete bullet, which may reduce ATS quality.',
    //   strengths: [
    //     'React, Next.js, TypeScript, Redux, TailwindCSS proficiency',
    //     'Accessibility (ADA/WCAG) focus and patterns',
    //     'Performance optimization and scalable component architecture',
    //     'Experience with real-time, high-traffic chat UIs (1M+ MAU)',
    //     'Cross-functional collaboration with product and backend teams',
    //     'Node.js/Express REST API familiarity',
    //     'CI/CD and Docker listed; Git/GitHub/GitLab experience',
    //     'Enterprise client-facing work and reusable platform foundation',
    //   ],
    //   gaps: [
    //     'No explicit testing tools or practices (Jest, React Testing Library, Cypress, Playwright)',
    //     'No cloud/platform experience listed (AWS/GCP/Azure) despite enterprise scale',
    //     'No GraphQL or API schema typing mentioned, which is common in modern web stacks',
    //     'No explicit design system ownership or contributions called out',
    //     'Limited monitoring/observability (Datadog, New Relic, Sentry) and analytics instrumentation',
    //     'No security/compliance keywords (SSO/OAuth, SOC2, PII) relevant to HR/payroll domain',
    //     'Potential seniority gap if role targets Senior+ (summary states 4+ years)',
    //     'Resume clarity issues: duplicated bullets across roles and one truncated bullet',
    //     'No Ruby/Rails exposure if stack leans that way',
    //     'Location/onsite-hybrid flexibility not stated for a NYC-based company',
    //   ],
    //   recommendations: [
    //     'Add a Testing section and reference concrete tools and impact (e.g., Jest/RTL unit tests, Cypress/Playwright e2e; increased coverage to X% or caught regressions pre-release).',
    //     'List cloud experience used (AWS/Azure/GCP) and relevant services (S3, CloudFront, Lambda, ECS) or add a brief project demonstrating deployment at scale.',
    //     'Include GraphQL if applicable (schema design, Apollo/urql) or emphasize strong REST patterns with typing (OpenAPI/Swagger, Zod/TypeScript types).',
    //     'Highlight any design system work (component library contributions, Storybook, theming tokens) and cross-app reuse.',
    //     'Add observability and quality signals (Sentry, Datadog, New Relic, performance budgets, Core Web Vitals improvements with quantified results).',
    //     'Expand accessibility details (WCAG 2.1 AA, ARIA roles, keyboard navigation, screen reader testing) and add measurable outcomes.',
    //     'Quantify impact in bullets (e.g., reduced render time by X%, improved TTI by Y%, raised conversion by Z%).',
    //     'Fix the truncated bullet and remove duplicated bullets across roles; tailor responsibilities per company to improve ATS deduping.',
    //     'If applicable, add security/compliance experience (OAuth2/OIDC, secure handling of PII, SOC2 practices) relevant to HR/payroll.',
    //     'Clarify seniority and scope (team size, mentorship, ownership of initiatives) to align with potential Senior/Staff expectations.',
    //     'Note location flexibility (NYC hybrid/commute-ready) to match possible onsite expectations at .',
    //     'Map keywords from the job post explicitly in Skills (e.g., feature flags, feature rollout, A/B testing, Redux Toolkit, React Query/TanStack Query).',
    //   ],
    // };

    return res.status(200).json({ resume, result: score });
  } catch (error) {
    console.error('Mini ATS route error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
});

export default router;
