# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e14]:
    - heading "Welcome Back" [level=1] [ref=e15]
    - paragraph [ref=e16]: Sign in to your account
    - generic [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]: Email
        - textbox "Email" [ref=e20]:
          - /placeholder: you@example.com
      - generic [ref=e21]:
        - generic [ref=e22]: Password
        - textbox "Password" [ref=e23]:
          - /placeholder: ••••••••
      - button "Sign In" [ref=e24]
    - paragraph [ref=e25]:
      - text: Don't have an account?
      - link "Sign up" [ref=e26] [cursor=pointer]:
        - /url: /register
```