#!/bin/bash -xe

get_timestamp() 
{
    date '+%Y-%m-%d.%H-%M-%S%Z'
}

build_docker_image ()
{
    yarn build:docker
}

tag_docker_image ()
{
    docker tag biowink/helloclue.com "biowink/contentful-backup:$(get_timestamp)"
}

push_to_dockerhub ()
{
    docker push "biowink/contentful-backup:$(get_timestamp)"
}

build_docker_image
tag_docker_image
push_to_dockerhub