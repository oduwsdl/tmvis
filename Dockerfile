ARG     NODE_TAG=latest
FROM    node:$NODE_TAG

LABEL   app.name="TMVis" \
        app.description="An archival thumbnail visualization server" \
        app.repo.url="https://github.com/oduwsdl/tmvis" \
        app.maintainer="Maheedhar Gunnam <mgunnam@cs.odu.edu>"

EXPOSE  3000

RUN     apt-get update && apt-get install -y \
          build-essential \
          imagemagick \
          fontconfig \
        && rm -rf /var/lib/apt/lists/*

ARG     PHANTOMJS_VERSION=2.1.1
RUN     cd /tmp \
        && wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-$PHANTOMJS_VERSION-linux-x86_64.tar.bz2 \
        && tar -xvjf phantomjs-$PHANTOMJS_VERSION-linux-x86_64.tar.bz2 phantomjs-$PHANTOMJS_VERSION-linux-x86_64/bin/phantomjs \
        && mv phantomjs-$PHANTOMJS_VERSION-linux-x86_64/bin/phantomjs /usr/local/bin/ \
        && rm -rf phantomjs-*

WORKDIR /app

COPY    ./package.json /app/
RUN     npm install
COPY    . /app

CMD     ["node", "tmvis.js"]
