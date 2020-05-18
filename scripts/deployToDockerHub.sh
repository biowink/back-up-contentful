#!/bin/bash -xe

build_docker_image ()
{
    yarn build:docker
}

tag_docker_image ()
{
    docker tag biowink/contentful-backup "biowink/contentful-backup:${GIT_SHA}"
}

push_to_dockerhub ()
{
    docker push "biowink/contentful-backup:${GIT_SHA}"
}

build_docker_image
tag_docker_image
push_to_dockerhub