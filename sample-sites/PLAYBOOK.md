# Client outreach playbook

Muhammad Tayyab is a student web developer in Dublin. He sells websites to local businesses
that don't have one. Outreach and replies go out from the connected Gmail account, vibecoders.ie@gmail.com.

The source of truth is Gmail labels in vibecoders.ie@gmail.com: `Outreach/Contacted`, `Outreach/Interested`, `Outreach/Bounced` and `Outreach/Do not contact`. Before emailing anyone, search Gmail for that address (`to:<email> OR from:<email>`) and skip it if any thread exists. Label every outreach thread `Outreach/Contacted` as soon as it is sent, and move bounces, opt-outs and interested replies to the matching label.

`sample-sites/leads.json` is an optional local notes file. It is git-ignored and must never be committed (it lists business contact details and the repo is public). If it is missing, carry on: Gmail has everything.

After sending, check `from:mailer-daemon newer_than:1d` for bounces and label them `Outreach/Bounced`.

## 0. Legal rules (Ireland). These override everything below.
- Daily plan (agreed 2026-10-25): up to 5 replies to public "looking for a web developer / website" posts (Track A,
  Ireland or international), plus up to 5 cold emails to Irish *registered companies* (Track B). No international cold email.
- Track A is a reply to someone's own request, so it is not unsolicited marketing. Only reply where the post invites contact
  (gives an email or says "email me"), is recent (under 30 days), and is not on a platform whose rules forbid moving off-platform
  (Upwork, Fiverr, Freelancer, PeoplePerHour: list those for Muhammad to apply to himself instead).
- Track A emails: short, specific to their request, link to a relevant sample if one fits, give the three packages, offer a quick call.
  Subject: "Re: your website request - <their project in a few words>".
- Track A sources to check each run (web search only; most sites can't be fetched): Activelink tenders (activelink.ie/vacancies/tenders,
  community and charity RFQs), Reddit r/forhire [Hiring] posts, Gumtree/Adverts.ie "wanted" ads. Bark.ie, PeoplePerHour, Upwork, Fiverr
  and eTenders need Muhammad's own account: list good matches for him to apply to, never contact those leads off-platform.
- Irish leads: mention the Local Enterprise Office Trading Online Voucher: it covers 50% of eligible costs (excl. VAT) up to EUR 2,500, but the business must be trading 6+ months, have 10 or fewer staff, attend a LEO seminar, and get approval BEFORE any work or payment. Never promise approval.
- Under S.I. 336/2011 (Reg. 13), cold marketing email to an individual (a sole trader, or a personal
  Gmail/Hotmail/Yahoo address belonging to a person) needs their prior consent. Cold email is only allowed to a
  company (a "Ltd"/DAC/CLG registered with the CRO) at a business address. So, when outreach resumes:
  - Email a business only after confirming it is a registered company (search "<name> CRO" / solocheck.ie / vision-net.ie).
  - Prefer role addresses (info@, bookings@, salon@...). Skip any address that looks like a person's name.
  - Sole traders: don't email them. List them in the run summary so Muhammad can call or visit in person instead.
- Every email must say who is sending, give a working reply address, and include a free one-click-style opt-out
  ("reply 'no thanks'"). Honour an opt-out the same day: label `Outreach/Do not contact` and never email again.
- GDPR: only store the business name, area and listed contact email. If anyone asks for their data to be deleted,
  remove their sample site and notes and confirm by reply. Delete notes for non-responders after 60 days.
- Sample sites must keep the "Unofficial design preview… not affiliated" banner and `noindex`. If a business asks,
  delete its sample site the same day.
- Never copy a business's logo or photos into a sample site without permission. Never claim to be affiliated.

## 1. Handle replies first
- Search Gmail for replies to our outreach threads (subject starts "A free website preview for"),
  and for any new inbound email from a business in `contacted`.
- "No thanks", "stop", "not interested", "unsubscribe" or anything hostile: reply once, politely
  ("No problem at all, I won't contact you again. Best of luck!"). Then move the business to
  `do_not_contact` and never email it again.
- Questions: answer warmly and briefly, using only the facts below. Always try to get them to agree
  to a short call or a visit, and ask for a good time and phone number.
- Interested / wants to go ahead: thank them, confirm the package they want, and ask for their logo,
  photos, price list, opening hours and a time to chat. Tell them Muhammad will be in touch
  personally to confirm the details.
- Never agree to discounts beyond the listed prices, custom payment plans, contracts, deadlines
  shorter than those listed, or anything not listed here. Say "Let me check that and come back to you",
  and flag it in the run summary for Muhammad.
- Never invent past clients, reviews, qualifications or a company registration.
- Set `status` to `replied`, `interested`, `call_booked`, `won` or `do_not_contact`, and add a short `notes` line.

## 2. Find and email up to 5 new businesses per run
- Target Dublin small businesses (salons, barbers, nail bars, cafés, takeaways, gyms, trades) whose
  only online presence is Facebook, Instagram or a directory such as Treatwell, Fresha or Golden Pages.
- Use WebSearch (Facebook and most sites can't be fetched directly; queries like
  "<business> <street> Dublin facebook contact email address" in extended mode surface listed emails).
- Only email an address that is publicly listed for the business. Skip a business if it has its own
  domain/website, if the email is uncertain, if it's already in `leads.json`, or if it's a large chain.
- Add a new entry to `businesses.json` (facts only: real services, address, phone, email; no invented
  prices or reviews; if hours are unknown, say "call for hours"). Pick a palette that suits the business.
  Run `python3 sample-sites/build.py`, screenshot to check it looks right, then commit and push.
  Preview URL format (use the new commit SHA):
  `https://rawcdn.githack.com/Muhammad-Tayyab-1027/FitnessStudioWebsite/<sha>/sample-sites/<slug>/index.html`
- Send the email in the same format as the first batch (see the template below), tailored with the
  street, the services and a Google search phrase customers would use.

## Facts for emails and replies
- Muhammad Tayyab, web developer and student in Dublin. Reply-to address: vibecoders.ie@gmail.com.
- The sample is only a preview. The real site is built around their requirements, with many more features.
- Student rates, below market (Dublin agencies are often €1,000 to €3,000+).
- Starter €249 one-off: one-page site, mobile friendly, call & WhatsApp buttons, Google Maps, contact form,
  Google Business Profile set-up, ready in 7 days.
- Business €449 one-off (most popular): everything in Starter, up to 5 pages, gallery, price list, online booking,
  Instagram feed, Google reviews, local SEO, 3 months free support.
- Premium €799 one-off: everything in Business, up to 10 pages, custom booking with email confirmations,
  gift vouchers/offers page, advanced SEO & Google Analytics, logo refresh, 6 months free support.
- Domain and hosting paid at cost (about €60 to €120/year), set up by Muhammad.
- Extras: social media management from €149/month; Google/Instagram/Facebook ads from €99/month plus ad budget;
  mobile apps quoted per project; logo & branding; maintenance from €19/month.
- Every outreach email ends with: "If you're not interested, just reply \"no thanks\" and I won't contact you again."

## Email template (HTML, adapt per business)
Subject: A free website preview for <Business>
Hi there, / intro (name, student web developer in Dublin, found them on <street>, no website yet) /
button "View your website preview" / preview disclaimer / why a website helps (Google search phrase) /
"Student rates, below market price" + three-package table / "More than just websites" list /
offer to call in for a no-pressure chat / signature: Muhammad Tayyab, Web Developer · Dublin,
vibecoders.ie@gmail.com / opt-out line.

## Run summary
End every run with a short summary: replies handled (and anything flagged for Muhammad), new businesses emailed, and leads skipped.
