#!/bin/bash -xe

build_docker_image ()
{
    yarn build:docker
}

tag_docker_image ()
{
    docker tag 974664203983.dkr.ecr.eu-west-1.amazonaws.com/contentful-backup "974664203983.dkr.ecr.eu-west-1.amazonaws.com/contentful-backup:${GIT_SHA}"
}

push_to_aws ()
{
    docker push "974664203983.dkr.ecr.eu-west-1.amazonaws.com/contentful-backup:${GIT_SHA}"
}

build_docker_image
tag_docker_image
push_to_aws