# deliveries-control-api
API to register and consult amount of products delivered by day, month or year.

## Technologies

- **Cloudant:** [IBM Cloudant](https://console.bluemix.net/docs/services/Cloudant/offerings/cloudant.com.html#cloudant-com) is a hosted and fully-managed database-as-a-service (DBaaS). It was built from the ground up to scale globally, run non-stop, and handle a wide variety of data types like JSON, full-text, and geospatial. Also it is a NoSQL database, allowing highly scalable access and and free format data structure. To know more about the NoSQL db you can see this [article](https://www.infoworld.com/article/3240644/nosql/what-is-nosql-nosql-databases-explained.html). 
- **GitHub:** used for versioning the code.
- **Node.js:** JavaScript runtime built on Chrome's V8 JavaScript engine for our Chatbot Back-end. To know more about Node, you can access [here](https://nodejs.org/en/).
- **Travis:** as a continuous integration platform, Travis CI supports your development process by automatically building and testing code changes, providing immediate feedback on the success of the change. Travis CI can also automate other parts of your development process by managing deployments and notifications. To know more about Travis, you can access [here](https://docs.travis-ci.com/user/for-beginners/).


## API

**All routes fall under /api/v[version_number]**

### POST /deliveries

Uploads a new delivery to the system. This route will check if data was sent correctly and save the delivery metadata into a cloudant database.

**Data Params:**
```
{
    deliveryman: string,
    date: string,
    total: number
}
```

**Success Response:**

**Code:** 200 OK.

**Body:**

```
{
    success: true,
    message: "The delivery was successfuly uploaded into the system",
    data: [delivery Object]
}
```

**Error Response:**

**Code:** 500 Internal Server Error.

**Body:**
```
{
    success: false,
    message: [string]
}
```

### PUT /deliveries/:_id/

Uploads a new version of a delivery to the system. This route will check if data was sent correctly and save the delivery metadata into a cloudant database.

**Data Params:**
```
{
    total: number
}
```

**Success Response:**

**Code:** 200 OK.

**Body:**

```
{
    success: true,
    message: "The delivery was successfuly edited into the system",
    data: [delivery Object]
}
```

**Error Response:**

**Code:** 500 Internal Server Error.

**Body:**
```
{
    success: false,
    message: [string]
}
```

### GET /deliveries/:deliveryman/:date_from/:date_to

Retrieves all deliveries registered in the system of a deliveryman by a period of time. As our database
will be set to return 100 docs maximum by query, our API returns a bookmark to keep track of the last request,
if it is null there is no more data to return.

**Success Response:**

**Code:** 200 OK.

**Body:**

```
{
    success: true,
    message: "The deliveries was successfuly retrieved",
    data: {
        docs: delivery Object[],
        bookmark: string||null
    }
}
```

**Error Response:**

**Code:** 500 Internal Server Error.

**Body:**
```
{
    success: False,
    message: [string]
}
```

### GET /deliveries/:_id

Retrieves a delivery registered in the system by its id.

**Success Response:**

**Code:** 200 OK.

**Body:**

```
{
    success: true,
    message: "The delivery was successfuly retrieved",
    data: [delivery Object]
}
```

**Error Response:**

**Code:** 500 Internal Server Error.

**Body:**
```
{
    success: False,
    message: [string]
}
```

## Getting started

```
- cp env-example .env
- open .env file and fill in the required environment variables
- npm install
- npm start
- To make API calls you can use your browser - GET requests only - Postman or curl. In this example we're using curl:
    - curl http://localhost:3004/deliveries/test
```

## Contact
Name                 | Email                              |Role  
---------------------|------------------------------------|-----------|
Gustavo Porto Guedes | gustavo.guedes@fatec.sp.gov.br     | Developer