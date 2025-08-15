# enjoy

Broadcast tool to automatically crop multiple instances of a Discord popout window capture in OBS. Better readme to follow sometime (maybe). Name inspired by a certain Touhou event.

Shoutouts to Mints.

# DISCLAIMER: THIS TOOL IS AGAINST DISCORD TOS. USE AT YOUR OWN RISK.

This program works by injecting code into a Discord popout window to read positions of video streams and names. I have been using this for over a year now, and I know of no one who ever got banned just *reading* data from a Discord window, but because this technically breaks Discord ToS, I am legally required to inform you in BIG SCARY LETTERS.

Don't bother asking Discord Support either, they are legally unable to tell you anything about their Developer terms. Thanks for being so forthcoming, Discord!

# Usage Documentation

- `npm install`
- `npm run build`
- Create .env file (based on .env.example)
- Enable Discord Dev tools by setting `"DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true` in %appdata%/discord/settings.json
- Popout the active Discord voice call window and fullscreen it on a monitor
  - Popout monitor should be at a higher resolution than your stream
- Import the provided OBS scene in obs-assets and build the rest of your layout around it
- Run the server: `node .`git
- Run init.js in the dev tools of the Discord popout window
- Start watching streams and hopefully Discord streams start being automatically cropped

# License

No license other than what's required to upload to Github. [Contact me](mailto:paul@schwandes.de) if you seriously plan on using this, this is for your own protection.