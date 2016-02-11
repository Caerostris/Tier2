# Tier 2

A simple HTML5/JS admin interface for ZeroTier root nodes.  
It's kind of the open source, stripped down version of [https://my.zerotier.net](https://my.zerotier.net) for anyone wanting to run their own root servers / root topology / world / whatever funky term they'll come up with on the next release.  
Please note this is still in pretty early stages. It's more user friendly than bare CURL. Slightly.

### Requirements

* ZeroTierOne **with Network Controller support** (read below!)
* Nginx / Apache
* HTTPS certificate

### Setup

The setup is fairly straightforward.  

1. Install & update Nginx or Apache configuration from `config/`
2. Move everything in `html/` into your web root (`/var/www/html` by default)
3. Yay!

### Screenshots

Have a look at `docs/screenshots`

### ZeroTier Network Controller Support

The standard distribution of ZeroTier cannot function as a Network Controller.  
Thus, Tier2 is not going to work with it. It will give 404 errors.  
In order to enable Network Controller Support, you need to download & compile ZeroTier from source with the `ZT_ENABLE_NETWORK_CONTROLLER` option set to `1`.  
This can be done as follows:  

    git clone https://github.com/zerotier/ZeroTierOne.git
    cd ZeroTierOne
    make ZT_ENABLE_NETWORK_CONTROLLER
    make installer # on linux
    make mac-dist-pkg # on mac

Now install the generated binary or package.

### FAQ

* But why do I need an HTTPS certificate?
    * [Let's Encrypt](https://letsencrypt.org/) now issues free certificates, you've got no excuse.
* But is it secure to just use the API secret as password?
    * It's not ideal, but kinda secure unless you disable HTTPS. 
* Thanks for doing this!
    * Don't worry, I'm just procrastinating. I should be revising.
* I already have Nginx running. Can I run this from a sub-directory?
   * Should work, even though I haven't tested it. You'll have to integrate the config files in `config/` into your current config
* I don't like the theme. Can I change it?
    1. You should like it, because it looks cool
    2. Yep, just find a better bootstrap theme (good luck!), place it in the `css/` folder and replace the theme in `index.html` and `network.html`. You should also update `css/zt_network.css`.
* How about Apache?
    1. @mcondarelli has provided Apache configs. I added TLS directives but I have not personally tested the modified configuration file. It's not my fault if that config formats your hard drive. You have been warned.

### TODO

* Show loading indicators while loading stuff (opening pages and saving settings)
* Proper login with user/password
* Refactor JavaScript view code to be less crappy
* Error handling

### License

[MPLv2](https://www.mozilla.org/en-US/MPL/2.0/)
