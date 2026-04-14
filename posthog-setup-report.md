<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into LesCordistes.com. The project already had the PostHog SDK installed (`posthog-js`, `posthog-node`), an `instrumentation-client.ts` initialization file, a `/ingest` reverse proxy in `next.config.ts`, and a server-side client in `posthog-server.ts`. Environment variables (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`) were confirmed and updated in `.env.local`.

Seven event capture calls were added across six files covering the full user journey — from registration and login through to job posting, lead unlocking, and credit purchases. User identification (`posthog.identify`) was added at signup and login to link anonymous sessions to named users. Server-side tracking was implemented in the Stripe webhook handler using `captureImmediate` to guarantee delivery before the serverless function returns.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | Pro user completed registration form and OTP sent | `src/views/RegisterPro.tsx` |
| `user_signed_up` | Client user completed registration form and OTP sent | `src/views/RegisterClient.tsx` |
| `user_logged_in` | User authenticated via password or magic link | `src/views/Login.tsx` |
| `checkout_initiated` | Pro user clicked to purchase a credit pack | `src/views/Credits.tsx` |
| `lead_unlocked` | Pro user successfully unlocked a lead with credits | `src/components/credits/UnlockLeadButton.tsx` |
| `job_posted` | Client submitted a new job (standard or renfort) | `src/views/PostJob.tsx` |
| `credits_purchased` | Stripe webhook confirmed payment and credits added (server-side) | `src/app/api/webhook/route.ts` |

## Next steps

We've built a dashboard and five insights to monitor user behavior based on the events just instrumented:

- **Dashboard**: [Analytics basics](https://eu.posthog.com/project/159130/dashboard/621133)
- **Signup & Login Funnel**: [https://eu.posthog.com/project/159130/insights/0yG6vaiM](https://eu.posthog.com/project/159130/insights/0yG6vaiM)
- **Credit Purchase Funnel**: [https://eu.posthog.com/project/159130/insights/V4Ddw0TQ](https://eu.posthog.com/project/159130/insights/V4Ddw0TQ)
- **Key Events Over Time**: [https://eu.posthog.com/project/159130/insights/ioOKhLH3](https://eu.posthog.com/project/159130/insights/ioOKhLH3)
- **Signups by Role**: [https://eu.posthog.com/project/159130/insights/l8S5sezJ](https://eu.posthog.com/project/159130/insights/l8S5sezJ)
- **Full Conversion Funnel**: [https://eu.posthog.com/project/159130/insights/k2Fhwnfd](https://eu.posthog.com/project/159130/insights/k2Fhwnfd)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
