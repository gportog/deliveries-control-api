#!/usr/bin/env bash

###########################################################################
#
#
#
# NAME:         deployCloudFoundry.sh
#               Requires Environment Variables set on Travis:
#                - CF_USER <inside travis.yml>
#                - CF_PW <inside travis settings>
#                - CF_SPACE <inside travis settings>
#                - CF_ORG <inside travis settings>
#                - CF_TARGET <inside travis.yml>
#                - NUMBER_INSTANCES <inside travis.yml>
#                - MEMORY_SIZE <inside travis.yml>
#                - APP_NAME <inside travis.yml>
#                - APP_VERSION <inside travis.yml>
#                - SESSION_SECRET <inside travis settings>
#                - CLOUDANT_USER <inside travis settings>
#                - CLOUDANT_PW <inside travis settings>
#
# AUTHOR:
#               Gustavo Porto Guedes <gustavo.guedes@fatec.sp.gov.br>
#
# DATE:         May 2019 , Version 1.0
#
#
# ABOUT:        Used to deploy the application on IBM Cloud 
#                - Cloud Foundry Node.js runtime
#
# SETUP:        chmod +x deployCloudFoundry.sh
#               ./deployCloudFoundry.sh <environment>
#               
#
############################################################################

REQUIRED=("CF_USER" "CF_PW" "CF_SPACE" "CF_ORG" "CF_TARGET" "NUMBER_INSTANCES" "MEMORY_SIZE" "APP_NAME" "APP_VERSION" "CLOUDANT_USER" "CLOUDANT_PW")
ENV=$1

if [ -z "${1}" ]; then
    echo "Missing 'env' parameter. Example: ./deployCloudFoundry.sh dev"
    exit 1
fi

echo "Checking environment variables..."
for name in ${REQUIRED[*]}; do
    if [ -z "${!name}" ]; then
        echo "The '${name}' environment variable is required."
        exit 1
    fi
done

echo "Checking environment to deploy..."
if [ ${ENV} != "prod" ]; then
    if [ ${ENV} = "dev" ]; then
        APP_NAME="${APP_NAME}-dev"
    else
        echo "Invalid environment. Env must be 'dev' or 'prod'."
        exit 1
    fi
fi

echo "Checking cf cli..."
if [ -z "$(which cf)" ]; then
    { # try
        curl -sLO http://go-cli.s3-website-us-east-1.amazonaws.com/releases/v6.13.0/cf-linux-amd64.tgz
        [ -f /usr/bin/sudo ] && sudo tar -xzf cf-linux-amd64.tgz -C /usr/bin
        rm -rf cf-linux-amd64.tgz
    } || { # catch
        echo "Error occured on cf installation."
        exit 1
    }
else
    echo "Found cf command, skipping install"
fi

echo "Building API..."
{ # try
    npm install
} || { # catch
    echo "Error occured on build."
    exit 1
}

echo "Logging on Cloud Foundry..."
{ # try
    cf api ${CF_TARGET}
    cf login -u ${CF_USER} -p ${CF_PW} -o ${CF_ORG} -s ${CF_SPACE}
} || { # catch
    echo "Error occured on cf login."
    exit 1
}

echo "Getting API to deploy..."

if cf apps | grep -i "${APP_NAME}-blue"
then
    APP_TO_USE="${APP_NAME}-green"
    APP_TO_DELETE="${APP_NAME}-blue"
else
    APP_TO_USE="${APP_NAME}-blue"
    APP_TO_DELETE="${APP_NAME}-green"
fi

echo "API to use: ${APP_TO_USE}"

echo "Deploying ${APP_TO_USE} API..."
{ # try
    cf push ${APP_TO_USE} -n "${APP_NAME}-temp" --no-start -i ${NUMBER_INSTANCES} -m ${MEMORY_SIZE}
    cf set-env ${APP_TO_USE} CLOUDANT_USER ${CLOUDANT_USER}
    cf set-env ${APP_TO_USE} CLOUDANT_PW ${CLOUDANT_PW}
} || { # catch
    echo "Error occured on deploy."
    exit 1
}

echo "INFO: starting API ${APP_TO_USE}... "

{ # try
    cf start ${APP_TO_USE}
    cf map-route ${APP_TO_USE} mybluemix.net -n ${APP_NAME}
    cf unmap-route ${APP_TO_USE} mybluemix.net -n "${APP_NAME}-temp"
} || {
    echo "Error occured on the start."
    exit 1    
}

echo "INFO: deleting app ${APP_TO_DELETE}... " 

if cf apps | grep -i ${APP_TO_DELETE}
then
    cf delete -f ${APP_TO_DELETE}
else
    echo "Error occured on the delete."
    exit 1    
fi
