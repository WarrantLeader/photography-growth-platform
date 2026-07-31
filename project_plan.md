# Photography Growth Platform

## Project Overview

A business development platform for photographers to discover potential clients, manage outreach campaigns, track leads, and analyse booking opportunities.

The aim is to solve a common problem for photography businesses: finding new clients and managing relationships before they become bookings.

This project is not designed to replace platforms such as Pixieset that focus on website hosting and photo delivery. Instead, it focuses on lead generation, customer relationship management, outreach tracking, and business analytics.

---

# Problem Statement

Photography businesses often struggle with:

* Finding suitable potential clients
* Keeping track of outreach
* Remembering previous conversations
* Measuring which marketing channels generate bookings
* Understanding which types of clients create the most value

Existing photography platforms mainly focus on delivering work after a booking has already happened.

This platform focuses on helping photographers create more opportunities.

---

# Target Users

Primary user:

* Independent photographers
* Photography businesses
* Small creative teams

Example use cases:

* Wedding photographers finding venues and suppliers
* Event photographers targeting companies
* Theatre photographers contacting organisations
* Corporate photographers building relationships

---

# Main Workflow

## 1. Discover Leads

Find potential clients through:

* Websites
* Social media
* Events
* Referrals
* Networking

Add them into the platform.

↓

## 2. Research Lead

Store information:

* Company name
* Contact details
* Industry
* Location
* Website
* Social media links
* Potential opportunity

↓

## 3. Outreach

Track communication:

* Emails
* Calls
* Meetings
* Messages

↓

## 4. Convert Lead

Move from potential client to confirmed booking.

↓

## 5. Analyse Results

Understand:

* Which sources create bookings
* Conversion rates
* Revenue generated
* Most valuable client types

---

# Minimum Viable Product

## Lead Management

Users should be able to:

* Add leads
* Edit leads
* Delete leads
* Search leads
* Filter leads
* Categorise leads

Lead information:

* Company name
* Contact name
* Email
* Phone number
* Website
* Industry
* Location
* Lead status
* Priority score
* Date added

---

# Sales Pipeline

A visual pipeline showing lead progress.

Stages:

New Lead

↓

Researching

↓

Contacted

↓

Interested

↓

Quote Sent

↓

Booked

↓

Lost

---

# Interaction Tracking

Record communication history.

Examples:

* Email sent
* Phone call
* Meeting
* Follow up

Information stored:

* Date
* Contact method
* Notes
* Outcome

---

# Client Conversion

When a lead becomes a customer, store:

* Event type
* Event date
* Revenue
* Project status
* Previous interactions

---

# Analytics Dashboard

Display:

## Lead Metrics

* Total leads
* Active leads
* Contacted leads
* Converted clients

## Business Metrics

* Conversion rate
* Average booking value
* Revenue by client type
* Best performing marketing channel

## Marketing Analysis

Track where leads come from:

* LinkedIn
* Instagram
* Website
* Referral
* Cold outreach

---

# Future Features

## Lead Scoring

Automatically rank opportunities.

Example:

High score:

* Local business
* Regular events
* Active social media
* No existing photographer

Low score:

* No clear contact
* Limited activity
* Outside target market

---

## Outreach Automation

Possible features:

* Follow up reminders
* Email templates
* Campaign tracking
* Weekly outreach reports

---

## AI Assistant

Potential features:

* Generate personalised outreach messages
* Suggest leads to contact
* Summarise previous conversations
* Recommend next actions

---

## Photo Delivery Integration

Optional future feature.

The platform does not replace existing delivery services.

Instead it stores:

* Gallery links
* Project history
* Client information

---

# Technology Stack

## Frontend

React

Used for:

* User interface
* Dashboards
* Forms
* Data visualisation

---

## Backend

Python FastAPI

Used for:

* API development
* Business logic
* Data processing

---

## Database

PostgreSQL

Stores:

* Leads
* Clients
* Projects
* Interactions
* Analytics data

---

## Deployment

Docker

Used for:

* Application packaging
* Local development
* Deployment consistency

---

# Database Structure

## Leads Table

Stores potential clients.

Fields:

* id
* company_name
* contact_name
* email
* phone
* website
* industry
* location
* status
* priority_score
* source
* date_added

---

## Interactions Table

Stores communication history.

Fields:

* id
* lead_id
* type
* date
* notes
* outcome

---

## Projects Table

Stores completed work.

Fields:

* id
* lead_id
* event_type
* event_date
* revenue
* status

---

## Sources Table

Stores marketing channels.

Examples:

* LinkedIn
* Website
* Referral
* Instagram

---

# Development Roadmap

## Phase 1: Planning

Complete:

* Product requirements
* Database design
* User workflows
* Application architecture

---

## Phase 2: Core Application

Build:

* Database
* Backend API
* Lead creation
* Lead editing
* Lead viewing

---

## Phase 3: User Interface

Build:

* Dashboard
* Lead pages
* Pipeline view
* Search and filtering

---

## Phase 4: Analytics

Add:

* Charts
* Conversion metrics
* Revenue tracking
* Marketing analysis

---

## Phase 5: Advanced Features

Add:

* Lead scoring
* Automation
* AI features
* External integrations

---

# Project Goal

Create a real software product that demonstrates:

* Full-stack development
* Database design
* Data analytics
* Product thinking
* Business problem solving

The project should be built around a real workflow from MRT Captures and demonstrate how software improves business operations.
