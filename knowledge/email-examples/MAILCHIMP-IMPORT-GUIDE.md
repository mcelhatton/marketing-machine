# Mailchimp Email Template Import Guide

This guide explains how to import the MDD HTML email templates into Mailchimp and send them to your audience.

---

## Email Templates Included

| File | Description | Best For |
|------|-------------|----------|
| `email-01-locateiq-saturday-chaos.html` | LocateIQ key/vehicle tracking - "Saturday Chaos" angle | GMs, Sales Managers, Owners |
| `email-02-workflow-automation.html` | Service & Recon Workflow automation | Service Managers, Used Car Managers |
| `email-03-vehiclevault-fi-revenue.html` | VehicleVault F&I revenue opportunity | F&I Managers, Owners, GMs |

---

## Method 1: Import as Custom HTML Template (Recommended)

### Step 1: Access Templates
1. Log into your Mailchimp account
2. Click **Campaigns** in the left sidebar
3. Click **Email templates**
4. Click **Create Template**

### Step 2: Choose Code Your Own
1. Select **Code your own**
2. Choose **Paste in code**
3. Give your template a name (e.g., "MDD - LocateIQ Saturday Chaos")

### Step 3: Paste the HTML
1. Open the HTML file in a text editor (VS Code, Sublime, TextEdit, etc.)
2. Select all content (`Cmd+A` on Mac, `Ctrl+A` on Windows)
3. Copy the content (`Cmd+C` or `Ctrl+C`)
4. Paste into Mailchimp's code editor (`Cmd+V` or `Ctrl+V`)
5. Click **Save and Exit**

### Step 4: Create a Campaign Using the Template
1. Go to **Campaigns** → **Create Campaign**
2. Select **Email** → **Regular**
3. Enter campaign name and click **Begin**
4. Set up your audience (To), sender info (From), and subject line
5. In the **Content** section, click **Design Email**
6. Select **Saved templates** tab
7. Choose your imported template
8. Make any final edits
9. Click **Save and Close**

---

## Method 2: Quick Import via Campaign Builder

### Step 1: Start a New Campaign
1. Click **Create** → **Email** → **Regular**
2. Name your campaign and click **Begin**

### Step 2: Set Up Campaign Details
- **To:** Select your audience/segment
- **From:** Set sender name and email
- **Subject:** Enter your subject line (suggestions below)

### Step 3: Design Email
1. Click **Design Email**
2. Select **Code your own** tab
3. Click **Paste in code**
4. Paste the HTML content from the template file
5. Click **Save and Close**

---

## Subject Line Suggestions

### Email 1: LocateIQ
- `Quick question about lost keys`
- `Saturday at 11:30am...`
- `How much time does your team spend searching?`

### Email 2: Workflow Automation
- `Your workflow dashboard looks organized. But is it accurate?`
- `Service wait times dropping from 2.5 hrs`
- `A question about your service lane`

### Email 3: VehicleVault F&I
- `A new profit center for dealerships`
- `$308K/mo in additional F&I revenue`
- `An F&I product with zero chargebacks`

---

## Merge Tags Included

These templates use standard Mailchimp merge tags:

| Tag | Description |
|-----|-------------|
| `*|UNSUB|*` | Unsubscribe link (required) |

### Optional Personalization Tags
You can add these to personalize the emails:

| Tag | Description |
|-----|-------------|
| `*|FNAME|*` | Recipient's first name |
| `*|LNAME|*` | Recipient's last name |
| `*|EMAIL|*` | Recipient's email address |
| `*|COMPANY|*` | Company name (if in your list) |

**Example personalization:**
Change the greeting from:
```html
<h1 style="...">It's Saturday at 11:30.</h1>
```
To:
```html
<h1 style="...">*|FNAME|*, it's Saturday at 11:30.</h1>
```

---

## UTM Tracking

All CTA links include UTM parameters for tracking:

```
?utm_source=mailchimp&utm_medium=email&utm_campaign=[campaign-name]
```

These will automatically track in Google Analytics. You can modify the `utm_campaign` value for each send.

---

## Pre-Send Checklist

Before sending each email:

- [ ] Preview in desktop and mobile views
- [ ] Send a test email to yourself
- [ ] Verify all links work correctly
- [ ] Check subject line length (under 50 characters ideal)
- [ ] Confirm audience/segment is correct
- [ ] Review unsubscribe link is working
- [ ] Check sender name and reply-to address

---

## Mobile Responsiveness

These templates are mobile-responsive. Key breakpoints:

- **600px and below:** Content stacks vertically, padding adjusts
- Tables with `class="mobile-full"` expand to 100% width
- Tables with `class="mobile-stack"` stack vertically

---

## Customization Tips

### Changing the Logo
Find this line and replace the `src` URL:
```html
<img src="https://mdd.io/hubfs/MDD%20Logos/MDD_Logo_White2.png" alt="Mobile Dealer Data" width="140"...>
```

### Changing CTA Button Color
Find the CTA `<td>` tag and modify `background-color`:
```html
<td style="border-radius: 8px; background-color: #8AC833;">
```

### Changing CTA Text
Find the `<a>` tag inside the CTA and modify the text:
```html
<a href="..." style="...">Schedule a 15-Min Demo &rarr;</a>
```

### Adding/Removing Sections
Each major section is wrapped in a `<tr>` (table row). You can:
- Delete entire `<tr>...</tr>` blocks to remove sections
- Copy and paste `<tr>...</tr>` blocks to duplicate sections
- Reorder sections by moving `<tr>...</tr>` blocks

---

## Troubleshooting

### Email looks different in Outlook
Outlook uses Microsoft Word as its rendering engine. The templates include Outlook-specific conditional comments (`<!--[if mso]>`) to handle this. If issues persist:
- Avoid complex CSS (gradients, shadows)
- Use table-based layouts (already done)
- Keep images under 600px wide

### Images not loading
- Ensure image URLs are absolute (start with `https://`)
- Host images on a reliable CDN (mdd.io/hubfs is recommended)
- Add descriptive `alt` text for images

### Unsubscribe link not working
The `*|UNSUB|*` merge tag only works when sent through Mailchimp. It won't work in test previews viewed directly in browser.

---

## Support

For questions about these templates:
- **MDD Support:** 844-292-7110
- **Website:** mdd.io

For Mailchimp-specific issues:
- **Mailchimp Help:** https://mailchimp.com/help/
