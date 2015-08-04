# BoundState Theme for HgWeb

  A clean, modern theme for Mercurial's [hgweb](http://mercurial.selenic.com/wiki/HgWebDirStepByStep]) using the [Bootstrap](http://twitter.github.com/bootstrap/) CSS framework. Extended with additional statuses for use with multiple repositories.

## Installation

  Download the files to a new folder `boundstate` in your hgweb themes folder
(`/usr/share/mercurial/templates` on default Ubuntu installs).

  Create a link to the static files:

    # cd /usr/share/mercurial/templates/static
    # ln -s ../boundstate/static/boundstate boundstate

  Edit your `hgweb.config` file to use the `boundstate` theme:

    [web]
    style = boundstate

  Theme needs `mercurial/hgweb/hgwebdir_mod.py` to be patched. Patch is included. It also uses `hgst.sh` from [olivetti/tools](https://github.com/md1023/olivetti/tree/master/tools) to display Jenkins jobs' statuses and dirty repositories.
  
  One more patch `mercurial/hgweb/webcommands.py` adds revision numbers to graph page.

## Screenshots

![commits](https://dl.dropboxusercontent.com/u/69495183/hgweb-boundstate-theme.png)

![commits](https://dl.dropboxusercontent.com/u/69495183/hgweb-boundstate-graph.png)
