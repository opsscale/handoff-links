# Handoff links: specification

Version 0.2, draft, October 2026. A convention for passing work an AI agent did on a website (a cart, a quote, a configuration, a booking) to the person the agent works for, so the site can connect the two without identifying anyone. [Punchline Analytics](https://punchline-site-tawny.vercel.app) implements it; anyone can. Comments and proposals are welcome as GitHub issues.

The key words "must", "should" and "may" are used as in RFC 2119.

## Why

A cloud agent's requests name its operator, never its user. When the agent builds something on a site and its user later arrives, the site sees two unrelated visits. UTM tags solved the same problem for campaigns by putting the context in the link; a handoff link does it for agents.

## Terms

- **Site:** the website where the agent built something.
- **Agent:** software acting for a person (the **user**).
- **Artifact:** what the agent built: a cart, quote, configuration, booking or other.
- **Handoff link:** a URL on the site, for the artifact, carrying a handoff token.
- **Opener:** whoever first loads the handoff link.

## The link

A handoff link is an `https` URL on the site's own domain with one query parameter added:

```
https://shop.example/cart/8431?pl_ho=Q7mZp2KxW9aBc4DeF6gHj8Lk
```

- The parameter name is `pl_ho`.
- The token **must** be 24 characters from `A–Z`, `a–z` and `0–9`, chosen at random by a cryptographically secure generator (about 143 bits).
- The token **must not** encode anything: no user, session, price or date. It's a lookup key only.
- The link **must** point at the site itself, and **should** point at the artifact (the cart or quote page), so it works as a normal link if the token is ignored.

## The site

When an agent builds an artifact, the site:

1. **Mints a token** and returns the handoff link to the agent, for example in the page, an API response or a structured receipt.
2. **Stores only a one-way hash** of the token (SHA-256 is recommended), never the token itself, with: the artifact's kind, its value and currency if any, when the link expires, and a reference to the agent's session if the site can tie one.
3. **Sets an expiry.** Links **should** expire after 30 days by default and **must not** last more than 90.
4. **Records opens.** When a request arrives with a well-formed `pl_ho` token, the site hashes it, looks it up, and if the link exists and hasn't expired, records the open against that visit. Malformed, unknown and expired tokens are ignored silently.
5. **Credits the first person.** Link previews, scanners and agents may fetch the link before the user does. The site **should** record those opens, but credit the first open by a person as the handoff's opener, replacing an earlier automated one.
6. **Strips the token from anything it stores**: page-view URLs, logs and analytics. The token is kept only as its hash.
7. **Counts a conversion** when the opener's visit goes on to complete an outcome the site defines (a purchase, a sign-up).

## Share links on pages (optional)

A site **may** add a handoff link to the version of a page it serves an AI assistant fetching for someone, so that any page can be handed off without a cart or quote. If it does:

- the link **must** be stated as a fact ("Share link to this page: …"), never as a request or instruction to the agent;
- the rest of the page **must** be unchanged: the same facts and claims people see;
- it **should** go only to assistants fetching for a person right now, not to search indexes or training crawlers, and the response **must not** be cacheable, since each carries its own token;
- the site **should** say publicly that it does this.

## The agent

An agent that receives a handoff link:

- **should** pass it to its user unchanged, as a link they can open;
- **should not** open it itself after handing it over (opening it to check it works, before, is fine);
- **may** show the artifact's summary next to it ("Your cart: 2 items, $249. Open it to check out").

## Privacy

- A handoff link identifies an artifact, never a person. Nothing about the user is put in the link, sent to the site, or required to make it work.
- The site learns that whoever opened the link went on to convert; it doesn't learn who they are.
- Anything used to tie the link to the agent's session (such as the agent's IP address and user agent) **should** be used in memory and not stored.
- Tokens **must not** be shared with third parties in the clear.

## Reporting

A site using handoff links can report, per period and per artifact kind:

| Measure | Meaning |
|---|---|
| Created | Links minted |
| Opened by a person | Links whose first open was a person |
| Opened by an agent only | Links fetched only by automated clients |
| Converted | Links whose opener completed an outcome |
| Value | Sums of artifact values for each of the above |

## Implementations

### Punchline Analytics

`POST /v1/handoffs` mints links (the site's server calls it with the artifact and, optionally, the agent's request); Punchline's edge install or browser snippet records opens; `GET /v1/handoffs` and **AI & agents → Handoffs** report them. See [Punchline's handoff links guide](https://punchline-site-tawny.vercel.app/docs/handoffs).

## Changes

- 0.2 (October 2026): share links on pages.
- 0.1 (October 2026): first draft.
