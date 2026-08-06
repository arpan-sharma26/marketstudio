# Market Studio Product Brief

## 1. Product Overview

Market Studio is an AI-powered digital marketing and lead-management platform initially focused on daycare businesses in Canada.

The platform helps daycare owners attract local parents, capture enquiries, respond quickly, book tours, follow up with prospective families, manage marketing content, optimize advertising campaigns, and connect marketing activity to actual enrolments.

Market Studio is not intended to be only a social-media content generator. Its core purpose is to operate the complete daycare marketing funnel:

**Attract parents → Capture enquiries → Qualify leads → Book tours → Follow up → Track enrolments → Improve marketing**

Market Studio will initially operate as an AI-assisted marketing agency platform used internally by the Market Studio team. Once the workflows are validated across multiple daycare clients, selected features may be converted into a client-facing SaaS platform.

---

## 2. Initial Market

### Industry

Canadian daycare and early-childhood education businesses.

### Initial client types

* Independent daycare centres
* Multi-location daycare businesses
* Montessori schools
* Preschools
* Before-and-after-school programs
* Daycare franchises
* New daycare locations preparing to open
* Daycare businesses seeking franchise partners

### Initial geographic focus

* Alberta
* Ontario
* Manitoba
* British Columbia

The system must support expansion across Canada and eventually the United States.

---

## 3. Primary Business Problem

Many daycare businesses experience the following problems:

* Enquiries are received through multiple disconnected channels.
* Staff respond slowly to parent enquiries.
* Leads are not followed up consistently.
* Marketing agencies report clicks and impressions but not enrolments.
* Daycare owners do not know which campaign generated each enrolment.
* Social-media content is irregular or repetitive.
* Marketing information varies between locations.
* Staff manually answer the same questions repeatedly.
* Reviews are not requested or managed systematically.
* Advertising campaigns are not optimized based on qualified leads.
* New daycare locations struggle to create local awareness before opening.

Market Studio will solve these problems through automation, AI agents, centralized data, and human approval controls.

---

## 4. Product Vision

Market Studio should become an AI-operated marketing department for daycare businesses.

The platform should eventually be able to:

1. Understand each daycare’s business, brand, programs, locations, and goals.
2. Create a marketing strategy for each daycare.
3. Generate monthly content and campaign plans.
4. Create branded social-media and advertising assets.
5. Publish approved content.
6. capture leads from websites, Meta, Google, phone calls, and other channels.
7. Respond to parent enquiries immediately.
8. Qualify parents based on their requirements.
9. Book daycare tours.
10. Follow up with leads until a final outcome is recorded.
11. Track waitlists, tours, applications, and enrolments.
12. Optimize advertising based on qualified leads and enrolments.
13. Produce understandable performance reports.
14. Recommend and prepare the next marketing actions.
15. Execute approved low-risk actions automatically.

---

## 5. Core Product Principles

### 5.1 Execution over recommendations

The platform should perform marketing work, not only provide suggestions.

For example, instead of only recommending that a daycare follow up with a lead, the platform should prepare or send the follow-up based on approved rules.

### 5.2 One source of truth

All client, location, brand, marketing, lead, communication, and performance information must be stored in a centralized system.

Supabase will be the initial central database and authentication platform.

### 5.3 Human approval for sensitive actions

AI should assist with decisions, but sensitive actions must require human approval.

Examples include:

* Publishing new content
* Responding to serious complaints
* Making claims about licensing or government funding
* Changing large advertising budgets
* Answering medical or developmental questions
* Rejecting enrolment applications
* Responding to negative reviews
* Using identifiable photographs of children

### 5.4 Multi-client architecture

The platform must be designed as a multi-tenant system from the beginning.

Each client must only access its own:

* Locations
* Leads
* Content
* Campaigns
* Appointments
* Reports
* Conversations
* Users
* Brand information

### 5.5 Location-level marketing

A single daycare client may operate multiple locations.

The system must support different information for every location, including:

* Address
* Phone number
* Email address
* Programs
* Age groups
* Capacity
* Availability
* Opening date
* Business hours
* Marketing offers
* Social accounts
* Advertising campaigns
* Leads
* Tour availability

### 5.6 Measurable business outcomes

The platform should prioritize the following results:

* Qualified leads
* Tours booked
* Tours attended
* Applications started
* Waitlist registrations
* Enrolments
* Cost per qualified lead
* Cost per tour
* Cost per enrolment

Vanity metrics such as reach and impressions should remain available but should not be the primary measure of success.

---

## 6. Primary Users

### 6.1 Market Studio Super Admin

A Market Studio team member who can:

* Create and manage clients
* Manage all client locations
* Configure integrations
* View all platform data
* Manage AI agents
* Review automation failures
* Create templates
* Manage billing
* View system-wide reporting

### 6.2 Market Studio Account Manager

A Market Studio employee responsible for specific clients.

The account manager can:

* View assigned clients
* Manage client content
* Review leads
* manage campaigns
* approve AI recommendations
* communicate with client users
* generate reports

### 6.3 Daycare Owner or Client Admin

A senior client user who can:

* View all client locations
* Review leads
* approve content
* view reports
* manage client users
* update approved business information
* view appointments and conversions

### 6.4 Daycare Location Manager

A user responsible for one or more locations.

The location manager can:

* View leads for assigned locations
* update lead statuses
* review appointments
* record tour outcomes
* update location availability
* approve location-specific content when permitted

### 6.5 Daycare Staff Member

A limited-access user who can:

* View assigned leads
* add notes
* update follow-up outcomes
* manage tours
* record attendance
* escalate conversations

---

## 7. Core Modules

## 7.1 Client Onboarding

The onboarding module will collect:

* Legal and operating business name
* Website
* Business description
* Brand logo
* Brand colours
* Brand tone
* Locations
* Programs
* Age groups
* Fees
* Hours
* Contact information
* Unique selling points
* Competitors
* Service areas
* Frequently asked questions
* Approved claims
* Restricted claims
* Marketing goals
* Social accounts
* Advertising accounts
* Privacy and consent information

The system should generate a structured brand profile after onboarding.

---

## 7.2 Location Management

Each client may have one or more daycare locations.

Every location should have:

* Public name
* Internal name
* Address
* City
* Province
* Postal code
* Phone number
* Email address
* Website URL
* Google Business Profile URL
* Opening date
* Operating hours
* Programs
* Age groups
* Capacity
* Current availability
* Tour scheduling rules
* Assigned staff
* Marketing status

---

## 7.3 Content Management

The content module should support:

* Instagram posts
* Facebook posts
* Reels
* Stories
* Carousels
* Google Business Profile posts
* Blog posts
* Email campaigns
* SMS campaigns
* Advertisements

Each content item should include:

* Client
* Location
* Content type
* Objective
* Caption
* Creative assets
* Call to action
* Scheduled date
* Approval status
* Publishing status
* Publishing platform
* AI generation details
* Performance metrics

Content statuses should include:

* Draft
* AI Generated
* Internal Review
* Client Review
* Changes Requested
* Approved
* Scheduled
* Published
* Failed
* Archived

---

## 7.4 Lead Management

The lead-management module is a core feature.

Leads may come from:

* Meta Instant Forms
* Facebook messages
* Instagram messages
* Website forms
* Website chatbot
* Google Ads
* Google Business Profile
* Phone calls
* Email
* Manual entry
* Referral campaigns
* Landing pages

Each lead should contain:

* Parent or guardian name
* Email
* Phone number
* Preferred location
* Child age group
* Program requested
* Desired start date
* Full-time or part-time requirement
* Preferred contact method
* Lead source
* Campaign
* Consent status
* Qualification score
* Assigned staff member
* Current status
* Next action date
* Notes
* Final outcome

Lead statuses should include:

* New
* Contact Attempted
* Contacted
* Qualified
* Unqualified
* Tour Offered
* Tour Booked
* Tour Completed
* Tour Missed
* Application Started
* Waitlisted
* Enrolled
* Not Interested
* No Response
* Duplicate
* Closed

---

## 7.5 Communication Management

The system should store and manage:

* Emails
* SMS messages
* WhatsApp messages when supported
* Facebook messages
* Instagram messages
* Chatbot conversations
* Phone-call summaries
* Internal notes

Every communication should be connected to:

* Client
* Location
* Lead
* Channel
* Sender
* Recipient
* Message direction
* Timestamp
* AI-generated status
* Approval status
* Delivery status
* Consent status

AI may draft or send routine responses based on approved rules.

Sensitive conversations must be escalated to a human.

---

## 7.6 Tour Scheduling

The tour-scheduling module should:

* Display available appointment times
* Book a tour
* assign the correct location
* assign an available staff member
* send confirmation messages
* send reminders
* allow rescheduling
* allow cancellation
* record attendance
* collect tour outcomes
* trigger post-tour follow-ups

Tour statuses should include:

* Requested
* Confirmed
* Rescheduled
* Cancelled
* Completed
* No Show

---

## 7.7 Campaign Management

The campaign module should support:

* Meta Ads
* Google Ads
* Organic social campaigns
* New-location launch campaigns
* Registration campaigns
* Waitlist campaigns
* Franchise campaigns
* Review campaigns
* Email campaigns
* SMS campaigns

Each campaign should have:

* Objective
* Client
* Location
* Channel
* Start date
* End date
* Budget
* Target audience
* Creative assets
* Landing page
* Lead source tracking
* Performance metrics
* AI recommendations
* Approval requirements

---

## 7.8 Reporting

Reports should combine:

* Advertising spend
* Impressions
* Clicks
* Landing-page visits
* Leads
* Qualified leads
* Tours booked
* Tours attended
* Applications
* Waitlist additions
* Enrolments
* Estimated enrolment revenue
* Cost per lead
* Cost per qualified lead
* Cost per tour
* Cost per enrolment

The AI reporting agent should explain:

* What changed
* Why it likely changed
* Which campaigns performed well
* Which locations performed well
* Which leads require attention
* What should be changed next
* Which recommendations need approval

---

## 8. AI Agents

### 8.1 Onboarding Agent

Responsibilities:

* Analyze onboarding responses
* Create the initial brand profile
* identify missing information
* organize approved claims
* create daycare FAQs
* summarize services and programs

### 8.2 Strategy Agent

Responsibilities:

* Create client marketing strategy
* define parent personas
* recommend channels
* identify campaign opportunities
* create content pillars
* establish campaign goals
* identify competitive positioning

### 8.3 Content Agent

Responsibilities:

* Generate captions
* generate content calendars
* create reel scripts
* create carousel copy
* create Google Business Profile posts
* create blog drafts
* produce content variations

### 8.4 Creative Agent

Responsibilities:

* Generate image briefs
* generate social-media graphics
* create advertising variations
* apply the correct logo and brand details
* validate contact information
* prepare assets for approval

### 8.5 Lead Qualification Agent

Responsibilities:

* Extract lead information
* classify parent intent
* score lead quality
* identify the correct location
* recommend the next action
* detect duplicate or incomplete leads

### 8.6 Lead Response Agent

Responsibilities:

* Draft or send immediate responses
* answer approved FAQs
* provide tour-booking options
* personalize follow-ups
* escalate sensitive questions
* summarize conversations for daycare staff

### 8.7 Advertising Agent

Responsibilities:

* Analyze campaign performance
* identify weak creatives
* recommend budget changes
* recommend audience changes
* recommend search-term exclusions
* generate new ad copy
* prepare campaign changes for approval

### 8.8 Reputation Agent

Responsibilities:

* Monitor reviews
* request reviews
* draft review responses
* identify repeated complaints
* escalate serious complaints
* summarize reputation trends

### 8.9 Reporting Agent

Responsibilities:

* Generate weekly and monthly reports
* explain results in plain language
* identify risks and opportunities
* recommend next actions
* prepare client meeting summaries

---

## 9. MVP Scope

The first sellable version should include:

1. Authentication and user roles
2. Client management
3. Multi-location management
4. Brand profiles
5. Client onboarding forms
6. Lead capture
7. Lead pipeline
8. Automated lead acknowledgement
9. Lead follow-up sequences
10. Tour scheduling
11. Content calendar
12. Content approval
13. Basic AI content generation
14. Basic reporting
15. Automation logs
16. Audit logs

---

## 10. Features Outside the Initial MVP

Do not prioritize these until the core workflow is stable:

* Fully autonomous advertising budget management
* Advanced social-media publishing across every platform
* Proprietary video generation
* Dedicated local SEO and GEO (AI-search visibility) module — planned as Phase 10 after
  campaigns/reporting; early footholds include Google Business Profile fields, presence
  audit, and approved FAQs/claims
* Payroll or employee management
* Child attendance tracking
* Full daycare-management software
* Tuition billing
* Government subsidy processing
* Medical record storage
* Developmental assessments
* Enrolment acceptance or rejection decisions

Market Studio is a marketing and lead-management platform, not a daycare operations or childcare-record system.

### Planned channel stack (after MVP core)

Once leads, tours, content, and basic reporting are stable:

1. Meta Ads (Facebook / Instagram) and Google Ads campaign management + attribution
2. Deeper Google Business Profile / local presence workflows
3. Local SEO + GEO recommendations grounded in approved brand and location data

---

## 11. Suggested Technology Stack

### Front end

* Next.js using the App Router
* TypeScript
* React
* Tailwind CSS
* Accessible reusable component library

### Back end

* Supabase
* PostgreSQL
* Supabase Authentication
* Supabase Storage
* Supabase Edge Functions where appropriate
* Row Level Security

### Automation

* n8n, Power Automate, or an equivalent workflow platform
* Webhooks
* Scheduled jobs
* Event-driven workflows

### AI

* AI model APIs for:

  * Content generation
  * Classification
  * Summarization
  * Lead scoring
  * Recommendations
  * Conversation assistance

### Integrations

* Meta
* Google Ads
* Google Business Profile
* Email provider
* SMS provider
* Calendar provider
* Website forms
* Analytics platform

---

## 12. Privacy and Compliance

The platform must be designed for Canadian privacy and communication requirements.

The system should:

* Record the source and date of consent
* store the wording or version of the consent form
* support unsubscribe requests
* avoid collecting unnecessary child information
* protect parent contact information
* limit access by client and location
* retain audit logs
* support data export and deletion requests
* avoid storing health or developmental information in the marketing CRM
* allow AI-generated messages to be identified internally
* require human review for sensitive communication

Never store secrets, passwords, API keys, or access tokens directly in application tables or source code.

---

## 13. Success Metrics

### Client acquisition metrics

* Number of active daycare clients
* Monthly recurring revenue
* Client acquisition cost
* Sales conversion rate
* Client retention rate

### Marketing performance metrics

* Leads generated
* Qualified leads
* Tours booked
* Tours attended
* Applications started
* Enrolments
* Cost per qualified lead
* Cost per tour
* Cost per enrolment

### Operational metrics

* Average lead-response time
* Percentage of leads receiving follow-up
* Percentage of content published on schedule
* AI recommendation acceptance rate
* Automation failure rate
* Manual hours saved per client
* Client approval turnaround time

---

## 14. Market Studio Positioning

Market Studio should not be positioned as only an AI content agency.

Preferred positioning:

> Market Studio is an AI-powered daycare growth platform that attracts local parents, responds to every enquiry, books more tours, and connects marketing activity to actual enrolments.

The platform should provide measurable business results while reducing the manual marketing workload of daycare owners and staff.
