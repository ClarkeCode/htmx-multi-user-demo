# HTMX Multi-User Demo

A small proof-of-concept demo of an application which simultaneously shares state and view between multiple users. Made with [HTMX](https://htmx.org).

## Quickstart

```bash
git clone git@github.com:ClarkeCode/htmx-multi-user-demo.git
cd htmx-multi-user-demo
npm install
node server.js
```

## Notes

1. User's page view is kept synchronized between tabs by the `/page-changed` polling div in `index.html`
	- Individual elements update their own state via HTMX Polling Attributes
2. When triggering the HX-Get of the page navigation buttons it can cause a double-load conflict with `/page-changed` polling on the tab where the button was clicked. I'm not yet certain how to properly debounce.