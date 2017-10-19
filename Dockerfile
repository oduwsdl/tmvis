FROM    ubuntu:16.04
LABEL   maintainer="Mat Kelly <mkelly@cs.odu.edu>"

EXPOSE  15421 15422 1338
WORKDIR /app

RUN     apt-get update && apt-get install -y \
          curl \
          git \
          imagemagick \
          nano \
          nodejs \
          npm \
          phantomjs \
        && rm -rf /var/lib/apt/lists/* \
        && ln -s /usr/bin/nodejs /usr/bin/node

COPY    ./package.json /app/
RUN     npm install
COPY    . /app

CMD     ["node", "AlSummarization.js"]
