/**
 * Generates a formatted thank-you letter from a requester to their referrer.
 */
export function generateThankYouLetter({ fromName, toName, requestTitle, referralDescription }) {
  return `Dear ${toName},

I wanted to take a moment to sincerely thank you for referring me for "${requestTitle}".

Your support and the referral you provided — "${referralDescription}" — made a real difference, and I am deeply grateful for the time and effort you put into helping me.

It means a lot to know that someone believes in me enough to put their name behind my application. I truly appreciate your trust and generosity.

With sincere gratitude,
${fromName}`;
}
