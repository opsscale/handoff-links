# Handoff links

**UTM tags for the agent era.** A small, open convention for passing work an AI agent did on a website (a cart, a quote, a configuration, a booking) to the person the agent works for, so the site can connect the two without identifying anyone.

```
https://shop.example/cart/8431?pl_ho=Q7mZp2KxW9aBc4DeF6gHj8Lk
```

## The problem

A cloud agent's requests name its operator (OpenAI, Anthropic, Perplexity), never its user. When an agent builds a cart on your site and its user later arrives to buy, you see two unrelated visits. The agent's work gets no credit, and you can't tell which agents bring you business.

## The idea

Put the context in the link, the way UTM tags do for campaigns and deferred deep links do for apps:

1. **The agent builds something** on the site.
2. **The site gives it a link to pass on** ("send this to your user"): the artifact's URL plus a random, opaque token in `pl_ho`.
3. **The person opens it.** The site records the open against their visit, and counts a conversion if that visit goes on to buy or sign up.

## Privacy, by construction

- The token is random and encodes nothing: no user, no session, no price.
- Sites store only a hash of it, and it expires (30 days by default, 90 at most).
- The site learns that whoever opened the link converted, never who they are.

## Read the spec

[SPEC.md](SPEC.md) (v0.2, draft): the link format, what a site does, what an agent does, privacy requirements, and what to report.

[examples/minimal.mjs](examples/minimal.mjs) shows the site side in about 40 lines of Node.js, with no dependencies.

## Status and feedback

This is a draft. If you build agents, run a site agents shop on, or work on agent protocols, we'd like to hear what's missing: open an issue.

Maintained by [Punchline Analytics](https://punchline-site-tawny.vercel.app), which implements it ([guide](https://punchline-site-tawny.vercel.app/docs/handoffs)).

## License

The specification (SPEC.md and this README) is licensed under [CC BY 4.0](LICENSE-SPEC): implement it, copy it, adapt it, with credit. The code in [examples/](examples/) is under the [MIT License](LICENSE-CODE).
