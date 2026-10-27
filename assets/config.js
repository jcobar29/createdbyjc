/* createdbyjc site settings — the only file you need to edit to connect the funnel.
   leadEndpoint: your Google Apps Script web-app URL (ends in /exec). See tools/google-sheets-leads.gs
                 for the 5-minute setup. It receives {firstName, email, source, createdAt, page}.
                 Leave "" until you have one. The form never pretends to save when nothing is connected.
   roadmapUrl:   the public Notion link to the 30-Day Content-to-Sales Roadmap (thank-you page button).
   facebookUrl:  where "Message createdbyjc on Facebook" points. */
window.CBJ_CONFIG = {
  leadEndpoint: "https://script.google.com/macros/s/AKfycbxIia6MmxgNI_YLEKM6R9MTyNSN7jDhKEdEsbr87-G943OypunZc3wEdojR_PoFSSqM/exec",
  roadmapUrl: "https://app.notion.com/p/Content-to-Sales-Roadmap-40590651dc7b81e7b81cff60fdd3e88c",
  facebookUrl: "https://www.facebook.com/createdbyjc.cobar/"
};
