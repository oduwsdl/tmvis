FROM       ubuntu:latest
MAINTAINER Mat Kelly <mkelly@cs.odu.edu>

RUN        apt-get update && \
           apt-get install -y git curl nano nodejs=0.10.25~dfsg2-2ubuntu1 npm phantomjs imagemagick
RUN        ln -s /usr/bin/nodejs  /usr/bin/node

ADD        . /app
WORKDIR    /app

RUN        npm install

EXPOSE     15421 15422 1338

CMD        ["node", "AlSummarization.js"]
