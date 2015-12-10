# Tier 2

A simple HTML5/JS admin interface for ZeroTier root nodes.  
It's kind of the open source, stripped down version of [https://my.zerotier.net](https://my.zerotier.net) for anyone wanting to run their own root servers / root topology / world / whatever funky term they'll come up with on the next release.

### Requirements

* ZeroTier (Duh!)
* Nginx
* HTTPS certificate for Nginx


### Setup

The setup is fairly straightforward.  

1. Install & update Nginx configuration from `nginx/`
2. Move everything in `html/` into your web root (`/var/www/html` by default)
3. Yay!

For now, you'll have to "log in" manually:
  
* Open a browser, go to your Tier 2 panel
* Open the dev tools
* Copy your auth secret in `/var/lib/zerotier-one/authtoken.secret` on the server
* Paste `window.localStorage.auth_secret = "auth_secret"` (and replace auth_secret with the secret you just copied) into the JavaScript console

### Screenshots

Have a look at `docs/screenshots`

### FAQ

* But why do I need an HTTPS certificate?
    * [Let's Encrypt](https://letsencrypt.org/) now issues free certificates, you've got no excuse.
* But is it secure to just use the API secret as password?
    * It's not ideal, but kinda secure unless you disable HTTPS. 
* Thanks for doing this!
    * Don't worry, I'm just procrastinating. I should be revising.
* I already have Nginx running. Can I run this from a sub-directory?
   * Should work, even though I haven't tested it. You'll have to integrate the config file in `nginx/` into your current config
* How about Apache configs?
   * You can generate the apache configs using the following commands:
   * `sudo apt-get remove apache2 && sudo apt-get install nginx`
* I don't like the theme. Can I change it?
    1. You should like it, because it looks cool
    2. Yep, just find a better bootstrap theme (good luck!), place it in the `css/` folder and replace the theme in `index.html` and `network.html`. You should also update `css/zt_network.css`.

### TODO

* Proper login
* Show loading indicators while loading stuff (opening pages and saving settings)
* Proper proper login with user/password
* Refactor JavaScript view code to be less crappy

### License

[MPLv2](https://www.mozilla.org/en-US/MPL/2.0/)
