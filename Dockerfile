ARG     NODE_TAG=latest
FROM    node:$NODE_TAG

LABEL   app.name="TMVis" \
        app.description="An archival thumbnail visualization server" \
        app.repo.url="https://github.com/oduwsdl/tmvis" \
        app.maintainer="Maheedhar Gunnam <mgunnam@cs.odu.edu>"

EXPOSE  3000

RUN     apt-get update && apt-get install -yq libgconf-2-4
RUN     apt-get update && apt-get install -y wget --no-install-recommends \
        && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
        && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
        && apt-get update \
        && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
          --no-install-recommends \
        && rm -rf /var/lib/apt/lists/* \
        && apt-get purge --auto-remove -y curl \
        && rm -rf /src/*.deb

#ADD     https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
#RUN     chmod +x /usr/local/bin/dumb-init

RUN     apt-get update && apt-get install -y \
          build-essential \
          imagemagick \
          fontconfig \
        && rm -rf /var/lib/apt/lists/*


ARG     PHANTOMJS_VERSION=2.1.1
RUN     cd /tmp \
      #  && wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-$PHANTOMJS_VERSION-linux-x86_64.tar.bz2 \
       && wget https://npm.taobao.org/mirrors/phantomjs/phantomjs-2.1.1-linux-x86_64.tar.bz2  \
       && tar -xvjf phantomjs-$PHANTOMJS_VERSION-linux-x86_64.tar.bz2 phantomjs-$PHANTOMJS_VERSION-linux-x86_64/bin/phantomjs \
       && mv phantomjs-$PHANTOMJS_VERSION-linux-x86_64/bin/phantomjs /usr/local/bin/ \
       && rm -rf phantomjs-*


WORKDIR /app

COPY    ./package.json /app/
RUN     npm install
COPY    . /app

CMD     ["node", "tmvis.js"]
