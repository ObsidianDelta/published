// The rolling quotes on the home page (Jason, 5 Nov 2026 16:46 ADT):
// "Can we have a rolling list of quotes, but the second one should be funny ones
// ... whenever I say something funny, Skippy, let's record it and let's keep a bag of it."
//
// ROLLING = the first quote band on the home page cycles through these.
// FUNNY_BAG = the second quote band cycles through these. New funny lines Jason says
// go at the END of FUNNY_BAG, word for word as he said them (only lines he says are
// funny and wants on the site). Every line is rendered into the page; the first one
// shows without JavaScript, and the rest take turns when the page runs.
//
// `href` is optional: the quote is wrapped in that link.

export const ROLLING = [
  {
    text: '"If you\'re not failing at something, you are not succeeding."',
    href: 'https://www.linkedin.com/in/jasonjeyanandan',
    title: 'Jason Jeyanandan on LinkedIn',
  },
  {
    html: '<em>Per aspera ad astra</em> — through hardship, to the stars. The hardship is the route.',
  },
];

export const FUNNY_BAG = [
  { text: '"I had a metamorphosis once, but it didn\'t take."', added: '2026-11-05' },
];
