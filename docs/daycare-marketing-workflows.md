Daycare Marketing Workflows
1. Purpose
This document defines the main business and automation workflows for Market Studio.
Each workflow should specify:
•	Trigger
•	Required data
•	Automated actions
•	AI actions
•	Human-review requirements
•	Outcome
•	Failure handling
•	Audit requirements
All workflows must be designed for multiple clients and multiple daycare locations.
________________________________________
2. Client Onboarding Workflow
Trigger
A Market Studio administrator creates a new client.
Required information
•	Client name
•	Primary contact
•	Contact email
•	Contact phone number
•	Website
•	Locations
•	Programs
•	Age groups
•	Brand logo
•	Brand colours
•	Brand voice
•	Social-media accounts
•	Marketing goals
•	Existing campaigns
•	Frequently asked questions
•	Privacy and consent language
Automated actions
1.	Create the client record.
2.	Create the primary client administrator.
3.	Send the onboarding invitation.
4.	Create an onboarding checklist.
5.	Create default client settings.
6.	Create default lead statuses.
7.	Create default content categories.
8.	Create default approval workflows.
9.	Notify the assigned Market Studio account manager.
AI actions
The Onboarding Agent should:
•	Summarize the daycare business
•	create a structured brand profile
•	identify missing information
•	generate initial parent personas
•	identify probable unique selling points
•	draft FAQs
•	recommend content pillars
•	flag unsupported or risky claims
Human review
A Market Studio account manager must review and approve:
•	Brand profile
•	FAQs
•	Marketing claims
•	Restricted topics
•	Initial strategy
Outcome
The client is marked as ready for marketing setup.
________________________________________
3. Location Setup Workflow
Trigger
A client or Market Studio user creates a daycare location.
Required information
•	Client
•	Location name
•	Address
•	City
•	Province
•	Postal code
•	Phone
•	Email
•	Website
•	Business hours
•	Programs
•	Age groups
•	Opening date
•	Tour availability
•	Capacity status
Automated actions
1.	Validate required fields.
2.	Associate the location with the client.
3.	Create default location settings.
4.	Generate the public location slug.
5.	Create location-specific lead routing.
6.	Create location-specific content filters.
7.	Configure tour availability.
8.	create an integration checklist.
AI actions
The system may:
•	Generate a location description
•	create locally relevant marketing messages
•	suggest surrounding target areas
•	generate location FAQs
•	recommend a launch campaign for new locations
Human review
The location manager must confirm:
•	Public contact details
•	Programs
•	Capacity
•	Availability
•	Opening date
•	Approved marketing claims
________________________________________
4. Monthly Content Planning Workflow
Trigger
The monthly content-planning schedule runs or an account manager manually requests a plan.
Inputs
•	Client brand profile
•	Locations
•	Programs
•	Current offers
•	Upcoming events
•	Canadian holidays
•	Seasonal themes
•	Previous content
•	Previous content performance
•	Current campaign objectives
•	Location availability
Automated actions
1.	Create the monthly planning period.
2.	retrieve relevant business information.
3.	retrieve recent content to prevent repetition.
4.	retrieve high-performing content themes.
5.	create content placeholders.
6.	assign planned publication dates.
7.	assign each item to a location or the entire client.
AI actions
The Content Agent should generate:
•	Monthly content themes
•	Post concepts
•	Captions
•	Calls to action
•	Reel scripts
•	Carousel outlines
•	Story ideas
•	Google Business Profile posts
•	Recommended objectives
•	Suggested creative briefs
Required content balance
The monthly calendar should include a balanced mix of:
•	Registration promotion
•	Program education
•	Parent education
•	Staff introductions
•	Facility highlights
•	Testimonials
•	Community content
•	Seasonal content
•	Frequently asked questions
•	New-location promotion
•	Brand trust content
•	Tour-booking calls to action
Human review
The account manager reviews content before client approval.
The client must approve content that includes:
•	Fees
•	Availability
•	Licensing claims
•	Subsidy claims
•	Testimonials
•	Photographs of children
•	Staff information
•	Offers or promotions
Outcome
Approved content is scheduled for publication.
________________________________________
5. Content Approval Workflow
Trigger
A content item is moved to client review.
Automated actions
1.	Notify authorized client reviewers.
2.	Provide the caption, asset, platform, location, and publishing date.
3.	allow the reviewer to:
o	Approve
o	Request changes
o	Reject
4.	record the reviewer’s decision.
5.	record the date and time.
6.	notify the account manager.
AI actions
When changes are requested, the Content Agent may:
•	summarize the requested changes
•	produce a revised caption
•	produce an updated creative brief
•	identify conflicts with brand rules
Approval rules
Content cannot be published unless:
•	It has an approved status.
•	The correct location details are present.
•	Contact information is valid.
•	Required media permissions are recorded.
•	No restricted claim is detected.
Outcome
Approved content moves to scheduling.
________________________________________
6. Content Publishing Workflow
Trigger
An approved content item reaches its scheduled publication time.
Automated actions
1.	Confirm the content remains approved.
2.	Confirm the publishing integration is active.
3.	Confirm the asset is accessible.
4.	Publish the content.
5.	store the platform post identifier.
6.	update the content status.
7.	record publishing results.
8.	notify the account manager if publishing fails.
Failure handling
If publishing fails:
1.	Set the status to failed.
2.	record the integration response.
3.	retry based on the configured policy.
4.	notify the responsible user.
5.	prevent duplicate publication.
________________________________________
7. New Lead Capture Workflow
Trigger
A lead is received from:
•	Meta
•	Website form
•	Google Ads
•	Website chatbot
•	Phone call
•	Email
•	Manual entry
•	Social-media message
Automated actions
1.	Validate the incoming payload.
2.	identify the client.
3.	identify the preferred location.
4.	normalize the email and phone number.
5.	search for duplicate leads.
6.	create or update the lead.
7.	record the lead source and campaign.
8.	store consent information.
9.	assign the appropriate owner.
10.	create the first lead activity.
11.	start the response workflow.
AI actions
The Lead Qualification Agent should extract:
•	Parent name
•	Child age group
•	Requested program
•	Desired start date
•	Preferred location
•	Full-time or part-time preference
•	Urgency
•	Parent questions
•	Probable lead quality
Duplicate rules
A lead may be considered a duplicate when:
•	The normalized email matches an existing lead.
•	The normalized phone number matches an existing lead.
•	The same person submits the same form within a configured time period.
Duplicates should not be deleted. They should be associated with the existing lead and recorded as additional activities.
Outcome
A new or updated lead is available in the correct location pipeline.
________________________________________
8. Immediate Lead Response Workflow
Trigger
A valid new lead is created.
Automated actions
1.	Check communication consent.
2.	check the lead’s preferred communication channel.
3.	select the approved response template.
4.	personalize the response.
5.	send the acknowledgement.
6.	notify assigned daycare staff when appropriate.
7.	create a follow-up task.
AI actions
The Lead Response Agent may:
•	personalize the greeting
•	summarize the enquiry
•	answer approved FAQs
•	recommend a relevant program
•	invite the parent to book a tour
•	identify questions requiring staff attention
Example response objective
The initial message should:
•	Confirm that the enquiry was received.
•	reference the correct daycare location.
•	acknowledge the parent’s stated requirement.
•	provide the next step.
•	offer tour booking when appropriate.
•	avoid guaranteeing availability.
Human escalation
The response must be escalated when the parent asks about:
•	Medical needs
•	Developmental needs
•	Allergies
•	Staff complaints
•	Child safety incidents
•	Legal issues
•	Licensing problems
•	Guaranteed placement
•	Special accommodation decisions
________________________________________
9. Lead Qualification Workflow
Trigger
A lead is created or additional information is received.
Qualification factors
•	Preferred location is within the service area.
•	Child is within a supported age group.
•	Requested program is offered.
•	Desired start date is reasonable.
•	Parent has provided valid contact information.
•	Parent demonstrates intent to book a tour or enrol.
•	Required schedule matches the daycare’s programs.
AI actions
The Lead Qualification Agent should calculate:
•	Qualification status
•	Qualification score
•	Missing information
•	Recommended next action
•	Suggested priority
Example scoring
•	Correct service location: +20
•	Supported age group: +20
•	Desired start date within 90 days: +20
•	Tour requested: +20
•	Valid phone and email: +10
•	Responded to follow-up: +10
The scoring model must be configurable by client.
Human review
AI qualification is advisory.
Daycare staff make final decisions about:
•	Availability
•	Waitlist placement
•	Admission
•	Special accommodations
•	Program suitability
________________________________________
10. Lead Follow-Up Workflow
Trigger
A lead has not completed the desired next action.
Example sequence
Follow-up 1
Send after the configured initial delay.
Purpose:
•	Confirm the parent received the response.
•	answer basic questions.
•	offer a tour.
Follow-up 2
Send after the second configured delay.
Purpose:
•	Re-emphasize the location or program.
•	provide a direct tour-booking link.
•	offer staff assistance.
Follow-up 3
Send after the third configured delay.
Purpose:
•	Ask whether the parent is still searching.
•	allow the parent to decline further follow-up.
•	provide a final call to action.
Stop conditions
The sequence must stop when:
•	The parent responds.
•	A tour is booked.
•	The lead enrols.
•	The parent opts out.
•	The lead is marked not interested.
•	Communication consent is withdrawn.
•	Staff manually pauses the sequence.
AI actions
AI may personalize the follow-up based on:
•	Lead details
•	Previous messages
•	Requested program
•	Desired start date
•	Location
•	Tour status
________________________________________
11. Tour Booking Workflow
Trigger
A qualified lead selects a tour time or staff books the tour manually.
Automated actions
1.	Confirm the selected location.
2.	confirm staff availability.
3.	create the appointment.
4.	update the lead status to tour_booked.
5.	send confirmation.
6.	create calendar events.
7.	schedule reminders.
8.	notify relevant staff.
9.	attach a lead summary to the appointment.
AI actions
The system should generate a concise staff summary containing:
•	Parent name
•	Child age group
•	Desired start date
•	Requested program
•	Important questions
•	Prior conversation summary
Outcome
The appointment is visible to authorized users and connected to the lead.
________________________________________
12. Tour Reminder Workflow
Trigger
A tour is approaching.
Automated actions
Send reminders according to client settings, such as:
•	24 hours before
•	2 hours before
The reminder may include:
•	Date
•	Time
•	Location
•	Parking information
•	Contact number
•	Rescheduling link
•	Cancellation link
Stop conditions
Do not send reminders for:
•	Cancelled tours
•	Completed tours
•	Invalid contact information
•	Withdrawn consent
________________________________________
13. Tour Outcome Workflow
Trigger
The scheduled tour time has passed.
Automated actions
1.	Ask assigned staff to record the outcome.
2.	allow selection of:
o	Completed
o	No show
o	Cancelled
o	Rescheduled
3.	collect staff notes.
4.	update the lead status.
5.	trigger the correct follow-up workflow.
Post-tour paths
Tour completed
Possible next steps:
•	Application follow-up
•	Waitlist follow-up
•	Enrolment follow-up
•	Additional questions
No show
Possible next steps:
•	Rescheduling message
•	Staff notification
•	Lead-priority adjustment
Enrolled
Possible next steps:
•	Mark conversion
•	stop marketing follow-ups
•	send conversion data to reporting systems
•	schedule a future review request when appropriate
________________________________________
14. Review Request Workflow
Trigger
An approved positive milestone occurs.
Examples:
•	Successful enrolment
•	Positive parent feedback
•	Completed onboarding period
•	Client-defined satisfaction event
Automated actions
1.	Check whether the family has already received a request.
2.	confirm the request is appropriate.
3.	send the approved review-request message.
4.	include the correct review link.
5.	record whether the link was clicked.
6.	avoid repeated requests within the configured period.
AI actions
AI may personalize the request but must not:
•	offer prohibited incentives
•	pressure the parent
•	write a review on behalf of the parent
•	request only positive reviews in a misleading manner
________________________________________
15. Review Response Workflow
Trigger
A new review is detected.
Automated actions
1.	Create the review record.
2.	classify sentiment.
3.	classify subject.
4.	draft a response.
5.	assign a reviewer.
6.	notify the appropriate user.
AI classifications
Possible topics:
•	Staff
•	Communication
•	Facility
•	Cleanliness
•	Programs
•	Pricing
•	Waiting list
•	Safety
•	Administration
•	General praise
Approval rules
Positive review responses may be approved through a simplified process.
Negative reviews must receive human review before publishing.
Serious allegations must be escalated immediately.
________________________________________
16. Weekly Campaign Analysis Workflow
Trigger
The weekly reporting schedule runs.
Automated actions
1.	Retrieve campaign data.
2.	retrieve website analytics.
3.	retrieve lead data.
4.	retrieve tour data.
5.	retrieve enrolment data.
6.	calculate funnel metrics.
7.	compare current and previous periods.
8.	create the report.
AI actions
The Advertising or Reporting Agent should identify:
•	Strongest campaign
•	Weakest campaign
•	Best location
•	Best audience
•	Best creative
•	Lead-quality changes
•	Cost changes
•	Conversion bottlenecks
•	Recommended next actions
Human review
Budget changes above approved limits require human approval.
Campaign pausing should require approval during the MVP.
________________________________________
17. Monthly Client Report Workflow
Trigger
The monthly reporting schedule runs.
Report contents
•	Executive summary
•	Marketing activity completed
•	Content published
•	Campaign performance
•	Leads generated
•	Qualified leads
•	Tours booked
•	Tours attended
•	Enrolments
•	Cost per result
•	Location comparison
•	Recommendations
•	Next-month plan
AI actions
The Reporting Agent should translate performance data into plain language.
The report should explain business outcomes rather than only advertising metrics.
________________________________________
18. Automation Failure Workflow
Trigger
An automation fails.
Automated actions
1.	Record the workflow name.
2.	record the client and location.
3.	record the input.
4.	record the error.
5.	record the retry count.
6.	classify severity.
7.	retry when safe.
8.	notify the responsible user.
9.	prevent duplicate actions.
Severity levels
•	Informational
•	Warning
•	Error
•	Critical
Critical examples
•	Lead not stored
•	Message sent to the wrong client
•	Cross-client data exposure
•	Duplicate campaign spending
•	Unauthorized content publication
•	Failure to process an opt-out request
________________________________________
19. Human Approval Matrix
AI may execute automatically
•	Data normalization
•	Duplicate detection
•	Lead categorization
•	Internal summaries
•	Routine acknowledgement messages
•	Approved follow-up templates
•	Tour reminders
•	Internal notifications
•	Draft generation
•	Report generation
Human approval required
•	New public content
•	Negative review responses
•	Sensitive parent communication
•	Large advertising-budget changes
•	Claims about availability
•	Licensing or subsidy claims
•	Public incident responses
•	Enrolment decisions
•	Use of identifiable child images
•	Major campaign changes
________________________________________
20. Audit Requirements
Every automated or AI-supported action must record:
•	Client
•	Location
•	User or agent
•	Action type
•	Input
•	Output
•	Timestamp
•	Approval status
•	Execution status
•	Related entity
•	Error information
•	AI model identifier when applicable
Audit records should be immutable for ordinary client users.
