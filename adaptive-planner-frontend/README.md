# Adaptive Day Companion

Build a polished, realistic frontend prototype for an AI-powered Adaptive Daily Planner designed to support neurodivergent users with planning, transitions, unexpected schedule changes, and reducing cognitive load.

IMPORTANT:

This is a hackathon prototype, not a production system.

Focus on UX/UI, interaction flow, visual polish, and demonstrating the core concept.

Use mock data and simulated AI responses.

Do NOT build a real backend, authentication system, database, or real LLM integration yet.

I will modify and connect the backend later.

==================================================

PRODUCT CONCEPT

==================================================

Product name: Adaptive

Tagline:

"Your day changes. Your plan adapts."

The product is NOT simply another calendar.

The core experience is:

PLAN → DISRUPTION → UNDERSTAND → ADAPT → CHOOSE

The system helps users:

1. Create and view their daily schedule.

2. Add activities using natural language.

3. Understand how unexpected changes affect their existing plans.

4. Receive multiple possible solutions instead of having the AI automatically change important plans.

5. Understand WHY the AI recommends certain options.

6. Get transition reminders between activities.

7. Ask "What should I do now?"

8. Optionally receive voice reminders from a physical desk companion.

9. Configure personal planning preferences.

The user always remains in control.

Never automatically reschedule important events without confirmation.

==================================================

TARGET USER EXPERIENCE

==================================================

The interface should feel:

- Calm

- Clean

- Modern

- Supportive

- Low cognitive load

- Accessible

- Not childish

- Not overly colorful

- Not visually overwhelming

Avoid:

- Dense traditional calendar layouts

- Too many colors

- Excessive animations

- Excessive notifications

- Complex dashboards

- Corporate enterprise UI

- Medical/clinical appearance

Use a soft modern SaaS/productivity aesthetic.

Use clear typography, generous spacing, rounded cards, subtle borders, and strong visual hierarchy.

The application should feel like a calm personal assistant rather than a complicated calendar.

==================================================

TECHNOLOGY

==================================================

Use:

- React

- TypeScript

- Tailwind CSS

- Modern component architecture

- Responsive design

- Lucide icons or another clean icon library

Use mock data only.

Make all important interactions functional on the frontend using local state.

==================================================

MAIN APPLICATION STRUCTURE

==================================================

Create a desktop-first responsive application with:

Sidebar navigation:

- Today

- Planner

- Insights

- Notifications

- Settings

Bottom/secondary section:

- Profile

- Preferences

Main navigation should be simple and easy to understand.

==================================================

SCREEN 1 — TODAY

==================================================

This is the primary screen.

Header:

"Good morning, Thai"

Subtitle:

"Here's how your day looks."

Show current date.

Top-right:

- notification icon

- profile/avatar

Main content:

A calm timeline showing today's activities.

Example mock schedule:

09:00 - 11:30

Deep Work

"Backend development"

Priority: High

11:30 - 12:00

Transition + Break

12:00 - 13:00

Lunch

13:00 - 15:00

Study

"Software Engineering"

15:00 - 15:30

Break

15:30 - 17:00

Team Meeting

17:30 - 18:00

Travel / Transition

19:00 - 20:30

Cafe with Friend

Each activity should show:

- time

- title

- category

- duration

- priority

- optional location

- transition/buffer indicator

Highlight the CURRENT activity.

Example:

"You're currently in Deep Work"

Show a subtle progress indicator.

At the bottom/right, add a prominent but calm button:

"What should I do now?"

==================================================

SCREEN 2 — ADAPTIVE PLANNER

==================================================

Create a page where users can interact with their schedule using natural language.

At the top:

"Plan your day naturally"

Large input:

"What would you like to add or change?"

Placeholder examples:

"I want to have coffee with my friend at 7 PM."

"Move my gym session to tomorrow."

"My meeting was extended by 1 hour."

Include:

- microphone icon

- send button

Below the input show example suggestions.

When the user enters:

"I want to have coffee with my friend at 7 PM."

Simulate AI understanding.

Show:

"Got it."

"Coffee with Friend"

19:00 - 20:30

Then show:

"Here's where it fits best based on your current schedule."

Display a proposed placement.

Buttons:

[ Add to my day ]

[ Change time ]

[ Cancel ]

Do not automatically commit important changes.

==================================================

SCREEN 3 — DISRUPTION / ADAPTIVE MOMENT

==================================================

This is the MOST IMPORTANT demo screen.

Create a polished scenario showing an unexpected schedule change.

Scenario:

Existing schedule:

16:30 - 17:30

Team Meeting

19:00 - 20:30

Cafe with Friend

Then introduce:

NEW EVENT

16:30 - 18:00

Unexpected Team Meeting Extension

Show a clear visual explanation:

"Your plan has changed."

"This may affect your 19:00 cafe plan."

Show an "Impact analysis" card.

Example:

Meeting extended by:

+30 minutes

Potential impact:

Cafe with Friend

Required transition/travel time:

30 minutes

Then show:

"AI suggestions"

Option 1:

Move Cafe → 18:45

Option 2:

Move Cafe → Tomorrow

Option 3:

Keep 19:00 and ask the meeting organizer about leaving early

Each option should explain WHY.

Example:

"Recommended because it preserves your existing commitment while keeping a 30-minute transition buffer."

IMPORTANT:

Do not label one option as universally "best".

Let the user choose.

Buttons:

[ Choose this option ]

[ View another option ]

[ Keep current plan ]

Also include:

"Why am I seeing these options?"

Clicking this should expand a short explanation of the reasoning.

==================================================

SCREEN 4 — "WHAT SHOULD I DO NOW?"

==================================================

Create a focused assistant screen/modal.

When the user clicks:

"What should I do now?"

Show current context:

Current time: 15:42

Current activity:

Study

Next activity:

Team Meeting at 16:30

Available time:

48 minutes

AI response:

"Continue your current task."

"You have about 35 minutes of focused time available."

"Start wrapping up around 16:10 so you have enough transition time."

Then show a mini timeline:

NOW

↓

Finish current task

↓

10 min transition

↓

16:30 Team Meeting

Add button:

"Start focus timer"

And:

"View today's plan"

==================================================

SCREEN 5 — TRANSITION ASSISTANT

==================================================

Create a page or modal showing upcoming transitions.

Example:

"Upcoming transition"

Deep Work

↓

10 minute transition

↓

Team Meeting

Explain:

"You have a 10-minute transition window."

Possible actions:

- Finish current task

- Prepare meeting notes

- Take a short break

- Start meeting early

This feature should emphasize that transitions are intentionally included in the schedule.

==================================================

SCREEN 6 — NOTIFICATIONS

==================================================

Create a calm notification center.

Categories:

Schedule change

Upcoming activity

Transition reminder

AI suggestion

Example:

"Your 16:30 meeting was extended."

"Your next activity starts in 15 minutes."

"Your schedule has been adjusted."

Allow users to mark notifications as read.

Include notification preferences.

Avoid notification overload.

==================================================

SCREEN 7 — DESK COMPANION

==================================================

Create an optional "Desk Companion" section.

This represents a future Raspberry Pi / physical voice assistant sitting on the user's desk.

Explain:

"Stay informed without constantly checking your phone."

Show a visual representation of a small desk device / speaker.

Status:

Connected

"Adaptive is ready to notify you."

Example voice notification:

"Your meeting starts in 15 minutes. You have a 10-minute transition buffer."

Controls:

Voice reminders: ON

Important changes: ON

Transition reminders: ON

Quiet hours: 22:00 - 07:00

Include a "Test voice reminder" button.

This is only a frontend simulation.

No real Raspberry Pi integration yet.

==================================================

SCREEN 8 — PREFERENCES

==================================================

Create a personalization page.

Section:

"How should Adaptive plan for you?"

Preferences:

Transition buffer:

[ 15 min ]

Travel time:

[ 20 min ]

Break preference:

[ Every 90 min ]

Maximum difficult tasks per day:

[ 3 ]

Quiet hours:

22:00 - 07:00

Voice reminders:

ON / OFF

Ask before changing important events:

ON

Allow AI to suggest schedule changes:

ON

The design should make it clear that these are personal preferences and not assumptions about all neurodivergent users.

==================================================

SCREEN 9 — DAILY SUMMARY

==================================================

Create a simple daily summary page.

Show:

Today's completed activities

Upcoming activities

Schedule changes

Adaptations made

Example:

"Your day changed 2 times."

"1 meeting was extended."

"1 activity was rescheduled."

"Your original priorities were preserved."

Avoid gamification-heavy elements.

Keep it calm and informative.

==================================================

CORE INTERACTIONS TO IMPLEMENT

==================================================

The prototype should support these demo interactions:

1. Add activity using natural language.

2. Display the activity on the timeline.

3. Trigger an unexpected schedule change.

4. Show impact analysis.

5. Generate 3 mock adaptive options.

6. Allow user to choose an option.

7. Update the timeline after the choice.

8. Ask "What should I do now?"

9. Show transition guidance.

10. Toggle notification preferences.

11. Toggle voice reminder.

12. Simulate a desk companion voice notification.

Use mock AI responses.

The interactions should feel real even though there is no backend.

==================================================

IMPORTANT UX PRINCIPLES

==================================================

1. Never overwhelm the user with information.

2. Always clearly distinguish:

- What happened

- What it affects

- What the AI suggests

- What the user can choose

3. Never automatically change important plans without confirmation.

4. Always explain reasoning in simple language.

5. Give multiple options when there is no single correct solution.

6. Respect user-defined preferences.

7. Make transition time visible.

8. Notifications should be meaningful, not constant.

9. The user is always the decision-maker.

10. Do not frame neurodivergence as something that needs to be "fixed" or "cured".

==================================================

DEMO SCENARIO

==================================================

Make sure the prototype has one polished end-to-end demo flow:

START:

User sees:

19:00

Cafe with Friend

Then a new unexpected event appears:

16:30 - 18:00

Team Meeting Extension

The system shows:

"Your plan has changed."

Then:

"This may affect your cafe plan."

Then:

"Here are some options."

Show 3 options.

User chooses:

"Move Cafe → 18:45"

The schedule updates.

Then the system displays:

"Your plan has been adapted."

Finally:

"Your 18:45 cafe plan still keeps a 30-minute transition buffer."

This should be visually impressive and easy for a hackathon judge to understand in less than 60 seconds.

==================================================

VISUAL DESIGN

==================================================

Create a polished high-fidelity prototype.

Use:

- Modern typography

- Soft neutral background

- Cards

- Rounded corners

- Subtle shadows

- Clear hierarchy

- Accessible contrast

- Minimal but meaningful color coding

Use color primarily to communicate state:

Normal

Current

Warning / change

Success

Optional AI suggestion

Do not make the interface look like a traditional calendar application.

The key visual identity should communicate:

"Calm"

"Adaptive"

"Personal"

"Supportive"

"Intelligent"

==================================================

FINAL REQUIREMENT

==================================================

Prioritize the following features above everything else:

1. Today timeline

2. Natural language planning

3. Unexpected change detection

4. Impact explanation

5. Multiple adaptive options

6. User confirmation

7. Transition assistant

8. "What should I do now?"

9. Personal preferences

10. Optional voice/desk companion

Make the prototype feel like a complete product even though the data is mocked.

Do not spend time building backend infrastructure.

Focus on making the UI polished, coherent, believable, and ready for a 2-day hackathon demo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fbd6fdf7-9344-5253-b6be-ac6161a56f3a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
