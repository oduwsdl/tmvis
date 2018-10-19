# Timemap Visualization

A web service for ArchiveThumbnails visualization based on Mat's (@machawk1) https://github.com/machawk1/ArchiveThumbnails which itself is an implementation of Ahmed AlSum's 2014 ECIR paper titled ["Thumbnail Summarization Techniques for Web
Archives"](http://www.cs.odu.edu/~mln/pubs/ecir-2014/ecir-2014.pdf) for the Web Archiving Incentive Program for Columbia University Libraries' grant, "Visualizing Digital Collections of Web Archives".


## Requirements

[Node.js](https://nodejs.org/) is required to run the service. Once Node is installed, the packages required to use the service can be installed by running `npm install -g` in the root of the project directory. [PhantomJS](http://phantomjs.org/) may also additionally be required depending on your system configuration.

## Running

To execute the code, run `node tmvis.js`.

To query the server instance generated using your browser visit `http://localhost:3000/alsummarizedtimemap/archiveIt/1068/4/[stats | summary]/http://4genderjustice.org/`, which has the attributes path as `primesource/ci/role/URI-R` substitute the URI-R to request a different site's summarization. The additional parameters of role is used to specify the values 'stats' or 'summary', stats: for getting the no of unique mementos and summary: to get the the unique mementos along with the screenshots captured,`ci` is used to specify the collection identifier if not specified the argument 'all' is used, `primesource` gets the value of 'archiveIt' or 'internetarchive' as to let the service know which is the primary source.

### Example URIs

* `http://localhost:3000/alsummarizedtimemap/archiveIt/1068/4/stats/http://4genderjustice.org/`
* `http://localhost:3000/alsummarizedtimemap/archiveIt/1068/4/summary/http://4genderjustice.org/`


## Running as a Docker Container (Non development mode: Recommended for naive users)
Follow the following steps:
```
$ git clone https://github.com/oduwsdl/tmvis.git
$ cd tmvis
$ docker image build -t timemapvis .
$ docker container run --shm-size=1G -it --rm -p 3000:3000 timemapvis node tmvis.js
```


## Running as a Docker Container (experimental)

Running the server in a [Docker](https://www.docker.com/) container can make the process of dependency management easier. The code is shipped with a `Dockerfile` to build a Docker image that will run the service when started. This document assumes that you have Docker setup already, if not then follow the [official guide](https://docs.docker.com/installation/).

### Building Docker Image
Clone the repository and change working directory (if not already) then build the image.

```
$ git clone https://github.com/oduwsdl/tmvis.git
$ cd tmvis
$ docker image build -t timemapvis .
```

In the above command `timemapvis` is the name of the image which can be anything, but the same needs to be used when running the container instance.

### Running Docker Container

```Running for the first time
docker run -it --rm timemapvis bash
```
In another terminal
```
cd tmvis
docker cp (CONTAINER ID CREATED ABOVE):/app/node_modules/ ./ 
```

```

docker run --shm-size=1G -it --rm -v "$PWD":/app -p 3000:3000 --user=$(id -u):$(id -g) timemapvis bash
node tmvis.js

```


In the above command the container is running in detached mode and can be accessed from outside on port `3000` at http://localhost:3000/. If you want to run the service on a different port, say `80` then change `-p 3000:3000` to `-p 80:3000`.

In order to persist generated thumbnails, mount a host directory as a volume inside the container by adding `-v /SOME/HOST/DIRECTORY:/app/assets/screenshots` flag when running the container.

Container is completely transparent from the outside and it will be accessed as if the service is running in the host machine itself.

In case if you want to make changes in the `tmvis` code itself, you might want to run it in the development mode by mounting the code from the host machine inside the container so that changes are reflected immediately, without requiring an image rebuild. Here is a possible workflow:

```
$ git clone https://github.com/oduwsdl/tmvis.git
$ cd tmvis
$ docker image build -t timemapvis .
$ docker container run --shm-size=1G -it --rm -v "$PWD":/app --user=$(id -u):$(id -g) timemapvis npm install
$ docker container run --shm-size=1G -it --rm -v "$PWD":/app -p 3000:3000 --user=$(id -u):$(id -g) timemapvis

```

Once the image is built and dependencies are installed locally under the `node_modules` directory of the local clone, only the last command would be needed for continuous development. Since the default container runs under the `root` user, there might be permission related issues on the `npm install` step. If so, then try to manually create the `node_modules` directory and change its permissions to world writable (`chmod -R a+w node_modules`) then run the command to install dependencies again.


### Regarding License

Though GPL Licensing was used for base (https://github.com/machawk1/ArchiveThumbnails) of this repository, but for this current one MIT license is in place and is changed with the permission from the original author @machawk1.


### Usage of the service

Running this service provides a user with the array of JSON object as the response (webservice model), which then has to be visualized with the UI tool deployed at http://tmvis.cs.odu.edu/ for which the code is available at https://github.com/oduwsdl/tmvis/ under the public folder.


## Request format (Role -> stats)
```
curl -il http://localhost:3000/alsummarizedtimemap/archiveIt/1068/4/stats/http://4genderjustice.org/

Mapping of attributes of URI to the values are as follows:
  primesource -> archiveIt
  hammingdistance -> 4
  role -> stats
  collection Identifier -> 1068
  URI-R under request -> http://4genderjustice.org/
```

## Response format
```
{
  "totalmementos": 21,
  "unique": 2,
  "timetowait": 0
}
```

## Request format (Role -> summary)
```
curl -il http://localhost:3000/alsummarizedtimemap/archiveIt/1068/4/summary/http://4genderjustice.org/

Mapping of attributes of URI to the values are as follows:
  primesource -> archiveIt
  hammingdistance -> 4
  role -> summary
  collection Identifier -> 1068
  URI-R under request -> http://4genderjustice.org/
```

## Response format
```
[
  {
    "timestamp": 1435787801,
    "event_series": "Thumbnails",
    "event_html": 'http://localhost:3000/static/timemapSum_httpwaybackarchiveitorg106820150701215641http4genderjusticeorg.png',
    "event_date": "Aug. 01, 2015",
    "event_display_date": "2015-07-01, 21:56:41",
    "event_description": "",
    "event_link": "http://wayback.archive-it.org/1068/20150701215641/http://4genderjustice.org/"
  },
  {
    "timestamp": 1435789960,
    "event_series": "Non-Thumbnail Mementos",
    "event_html": 'http://localhost:3000/static/notcaptured.png',
    "event_html_similarto": 'http://localhost:3000/static/timemapSum_httpwaybackarchiveitorg106820150701215641http4genderjusticeorg.png',
    "event_date": "Aug. 01, 2015",
    "event_display_date": "2015-07-01, 22:32:40",
    "event_description": "",
    "event_link": "http://wayback.archive-it.org/1068/20150701223240/http://4genderjustice.org/"
  },....
]
```
