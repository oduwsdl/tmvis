# Timemap Visualization

A commmand line tool set for ArchiveThumbnails visualization based on Mat's (@machawk1) https://github.com/machawk1/ArchiveThumbnails which itself is an implementation of Ahmed AlSum's 2014 ECIR paper titled ["Thumbnail Summarization Techniques for Web
Archives"](http://www.cs.odu.edu/~mln/pubs/ecir-2014/ecir-2014.pdf) for the Web Archiving Incentive Program for Columbia University Libraries' grant, "Visualizing Digital Collections of Web Archives".


## Requirements

[Node.js](https://nodejs.org/) is required to run the service. Once Node is installed, the packages required to use the service can be installed by running `npm install -g` in the root of the project directory. [PhantomJS](http://phantomjs.org/) may also additionally be required depending on your system configuration.

## Usage

The following command shows the way of executing the command line tool and the possible options:
 
node AlSummarization_OPT_CLI_JSON.js URI-R [--debug] [--hdt 4] [--ia || --ait] [--oes] [--ci 1068] [-os]

Here is the single line description of what each option stands for
URI-R -> ex: http://4genderjustice.org/
debug -> Run in debug mode
hdt -> Hamming distance Threshold
ia -> The Internet Archive as the source
ait -> Archive-It as the source
oes -> Override Existing Simhashes
ci -> Collection Identifi
os -> Only Simhash



## Running as a Docker Container (Non development mode: Recommended for naive users)
Follow the following steps:
```
$ git clone https://github.com/mgunn001/ArchiveThumbnails.git
$ cd ArchiveThumbnails
$ docker image build -t timemapvis .
$ docker container run --shm-size=1G -it --rm timemapvis 
node AlSummarization_OPT_CLI_JSON.js
```


## Running as a Docker Container (experimental)

Running the server in a [Docker](https://www.docker.com/) container can make the process of dependency management easier. The code is shipped with a `Dockerfile` to build a Docker image that will run the service when started. This document assumes that you have Docker setup already, if not then follow the [official guide](https://docs.docker.com/installation/).

### Building Docker Image
Clone the repository and change working directory (if not already) then build the image.

```
$ git clone https://github.com/mgunn001/ArchiveThumbnails.git
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
cd ArchiveThumbnails
docker cp (CONTAINER ID CREATED ABOVE):/app/node_modules/ ./ 
```

```

docker run --shm-size=1G -it --rm -v "$PWD":/app --user=$(id -u):$(id -g) timemapvis bash
node AlSummarization_OPT_CLI_JSON.js

```
