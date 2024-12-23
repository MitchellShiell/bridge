# Data Management & Storage

Song, Score, and the services they depend on (Postgres, MinIO, and Kafka) will be set up next. These Overture services will manage, track, and store all our data on the backend. 

## Setting up Object Storage

The file transfer service Score is compatible with any S3 storage provider; for simplicity, we will use the open-source object storage provider MinIO for this setup. 

1. **Run MinIO:** Use the following command to pull and run the MinIO docker container

    ```bash
    docker run -d --name minio \
    -p 9000:9000 \
    -e MINIO_ACCESS_KEY=admin \
    -e MINIO_SECRET_KEY=admin123 \
    -v $./persistentStorage/data-minio:/data \
    minio/minio:RELEASE.2018-05-11T00-29-24Z \
    server /data
    ```

    **Create buckets in MinIO:** Run the following command to create two buckets in the running MinIO server using the MinIO CLI - this will create an **object** bucket to store uploaded files and a **state** bucket for metadata files managed by Score.

    ```bash
    docker run --name minio-client \
    --entrypoint /bin/sh \
    minio/mc -c \
    '/usr/bin/mc alias set myminio http://host.docker.internal:9000 admin admin123 && \
    /usr/bin/mc mb myminio/state && \
    /usr/bin/mc mb myminio/object && \
    /usr/bin/mc mb myminio/object/data && \
    echo "" > /tmp/heliograph && \
    /usr/bin/mc put /tmp/heliograph myminio/object/data/heliograph && \
    rm /tmp/heliograph && \
    exit 0;'
    ```

    You should now be able to access the MinIO console from the browser at `localhost:9000`

    <details>
    <summary><b>For more details, click here</b></summary>

    ### Minio Image

    - The `-v $./persistentStorage/data-minio:/data` configures MinIO to store data in our local file system instead of in the docker container. Files you upload to MinIO will be stored at the path `./persistentStorage/data-minio`.

    ### Minio Client Image

    - **Alias:** `alias set myminio http://host.docker.internal:9000 admin admin123` creates an `alias` for the MinIO server, with an `admin` user with the password `admin123`.

    - **State Bucket:** `mb myminio/state` creates a bucket named "state". The "state" bucket is designated for storing application state data. This could include metadata about the objects stored in the "object" bucket.

    - **Object Bucket:** `mb myminio/object` creates another bucket named "object". The "object" bucket is intended for storing the actual content objects, such as VCFs, BAMs, etc. 

    - **Data directory & Heliograph File:** The `put` command seeds an empty 'heliograph' file within the object storage data folder. Score uses this dummy file to test that the server can successfully communicate with the storage provider and that your client can successfully retrieve files from it, too.

    </details>

## Setting up the Song Database

1. **Run PostgreSQL:** Use the following command to pull and run the PostgreSQL docker container

    ```bash
    docker run --name song-db \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=admin123 \
    -e POSTGRES_DB=songDb \
    -v ./persistentStorage/data-song-db:/var/lib/postgresql/data \
    -d postgres:11.1 
    ```
    <details>
    <summary><b>For more details, click here</b></summary>

    - This command runs a postgres image named `song-db` with the username `admin`, password `admin123` and a database within it called `songDb`.

    - We have included a persistent volume `-v ./persistentStorage/song-db-data:/var/lib/postgresql/data`. This volume stores Song's Postgres data in our local filesystem instead of the docker container; in other words, the data contained in the Song database will be stored at the path `./persistentStorage/song-db-data:/var/lib/postgresql/data`.

    </details>

    :::info Bringing it together
    By setting up MinIO alongside PostgreSQL, we have created an environment capable of handling both relational and object data storage, simulating a backend infrastructure similar to what you'd find in a cloud-based application.
    :::

## Running Kafka

Kafka serves as a distributed streaming platform, enabling high-throughput, fault-tolerant, and scalable messaging between Song and Maestro.

    :::info Why Kafka?
    Kafka serves as a message broker between Song and Maestro, enabling asynchronous communication between services. Kafka provides reliable message delivery and persistence, handling message queuing and processing at scale. This ensures fault tolerance when processing multiple indexing requests between Song and Maestro.
    :::

    The following configuration creates a single-node Kafka broker for development use:

1. **Create an env file:** Create a file named `.env.kafka` with the following content:

    ```bash
    # ==============================
    # Kafka Environment Variables
    # ==============================

    # Core Kafka Configuration
    KAFKA_PROCESS_ROLES=broker,controller
    KAFKA_NODE_ID=1
    KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092,EXTERNAL://localhost:29092
    KAFKA_LISTENERS=PLAINTEXT://kafka:9092,EXTERNAL://0.0.0.0:29092,CONTROLLER://kafka:9093
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,EXTERNAL:PLAINTEXT,CONTROLLER:PLAINTEXT
    KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT
    KAFKA_CONTROLLER_QUORUM_VOTERS=1@kafka:9093
    KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER

    # Storage Configuration
    KAFKA_LOG_DIRS=/var/lib/kafka/data
    KAFKA_LOG_RETENTION_HOURS=168
    KAFKA_LOG_RETENTION_BYTES=-1

    # Topic Configuration
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
    KAFKA_AUTO_CREATE_TOPICS_ENABLE=false
    KAFKA_NUM_PARTITIONS=1
    KAFKA_DEFAULT_REPLICATION_FACTOR=1
    KAFKA_MIN_INSYNC_REPLICAS=1

    # Performance Tuning
    KAFKA_MESSAGE_MAX_BYTES=5242880
    KAFKA_REPLICA_FETCH_MAX_BYTES=5242880

    # Logging Configuration
    KAFKA_LOG4J_LOGGERS=kafka.controller=INFO,kafka.producer.async.DefaultEventHandler=INFO,state.change.logger=INFO
    KAFKA_LOG4J_ROOT_LOGLEVEL=INFO

    # Cluster Configuration
    CLUSTER_ID=q1Sh-9_ISia_zwGINzRvyQ
    ```

    <details>
    <summary><b>Click here for a detailed breakdown</b></summary>

    #### Core Kafka Configuration
    - `KAFKA_PROCESS_ROLES`: Defines the roles this broker will fulfill (broker and controller)
    - `KAFKA_NODE_ID`: Unique identifier for this broker in the cluster
    - `KAFKA_ADVERTISED_LISTENERS`: External connection points other clients will use to connect
    - `KAFKA_LISTENERS`: Internal connection points for broker communication
    - `KAFKA_LISTENER_SECURITY_PROTOCOL_MAP`: Maps listener names to security protocols
    - `KAFKA_INTER_BROKER_LISTENER_NAME`: Listener used for inter-broker communication
    - `KAFKA_CONTROLLER_QUORUM_VOTERS`: List of controller nodes in the cluster
    - `KAFKA_CONTROLLER_LISTENER_NAMES`: Names of listeners used for controller connections

    #### Storage Configuration
    - `KAFKA_LOG_DIRS`: Directory where Kafka stores its log files
    - `KAFKA_LOG_RETENTION_HOURS`: How long to keep messages (7 days)
    - `KAFKA_LOG_RETENTION_BYTES`: Maximum size of the log before deletion (-1 means unlimited)

    #### Topic Configuration
    - `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR`: Replication factor for the offsets topic
    - `KAFKA_AUTO_CREATE_TOPICS_ENABLE`: Whether to allow automatic topic creation
    - `KAFKA_NUM_PARTITIONS`: Default number of partitions for new topics
    - `KAFKA_DEFAULT_REPLICATION_FACTOR`: Default replication factor for new topics
    - `KAFKA_MIN_INSYNC_REPLICAS`: Minimum number of replicas that must acknowledge writes

    #### Performance Tuning
    - `KAFKA_MESSAGE_MAX_BYTES`: Maximum message size (5MB)
    - `KAFKA_REPLICA_FETCH_MAX_BYTES`: Maximum size of messages that can be fetched

    #### Logging Configuration
    - `KAFKA_LOG4J_LOGGERS`: Specific logger levels for Kafka components
    - `KAFKA_LOG4J_ROOT_LOGLEVEL`: Default logging level for all components

    </details>

    :::tip For more detailed information about Kafka refer to:
    - [Confluent Kafka Documentation](https://docs.confluent.io/platform/current/installation/docker/config-reference.html#confluent-ak-configuration)
    - [Spring Cloud Stream Documentation](https://docs.spring.io/spring-cloud-stream/docs/current/reference/html/)
    - [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
    :::

2. **Run Kafka:** Use the docker run command with your `.env.kafka` file:

    ```bash
    docker run -d \
    --name kafka \
    --platform linux/amd64 \
    -p 9092:9092 \
    -p 29092:29092 \
    --env-file .env.kafka \
    confluentinc/cp-kafka:7.6.1
    ```

## Running Song

Song is our data cataloging system. It will provide submission validations and track and manage all our metadata and file data.

1. **Create an env file:** Create a file named `.env.song` with the following content:

    ```bash
    # ==============================
    # Song Environment Variables
    # ==============================

    # Spring Run Profiles
    SPRING_PROFILES_ACTIVE=prod,secure,kafka
    # Flyway variables
    SPRING_FLYWAY_ENABLED=true
    # Song Variables
    ID_USELOCAL=true
    SCHEMAS_ENFORCELATEST=true
    # Score Variables
    SCORE_URL=http://score:8087
    SCORE_ACCESSTOKEN=
    # Keycloak Variables
    AUTH_SERVER_PROVIDER=keycloak
    AUTH_SERVER_CLIENTID=dms
    AUTH_SERVER_CLIENTSECRET=t016kqXfI648ORoIP5gepqCzqtsRjlcc
    AUTH_SERVER_TOKENNAME=apiKey
    AUTH_SERVER_KEYCLOAK_HOST=http://keycloak:8080
    AUTH_SERVER_KEYCLOAK_REALM=myrealm
    AUTH_SERVER_SCOPE_STUDY_PREFIX=STUDY.
    AUTH_SERVER_SCOPE_STUDY_SUFFIX=.WRITE
    AUTH_SERVER_SCOPE_SYSTEM=song.WRITE
    SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI=http://keycloak:8080/realms/myrealm/protocol/openid-connect/certs
    AUTH_SERVER_INTROSPECTIONURI=http://keycloak:8080/realms/myrealm/apikey/check_api_key/
    # Postgres Variables
    SPRING_DATASOURCE_URL=jdbc:postgresql://song-db:5432/songDb?stringtype=unspecified
    SPRING_DATASOURCE_USERNAME=admin
    SPRING_DATASOURCE_PASSWORD=admin123
    # Kafka Variables
    SPRING_KAFKA_BOOTSTRAPSERVERS=http://kafka:9092
    SPRING_KAFKA_TEMPLATE_DEFAULTTOPIC=song-analysis
    # Swagger Variable
    SWAGGER_ALTERNATEURL=/swagger-api
    ```

    :::info Score Access Token
    We will update our `SCORE_ACCESSTOKEN` value after portal deployment. Once Stage, our portal UI is deployed, we can more easily generate an admin API key with the appropriate credentials
    :::

    <details>
    <summary><b>Click here for a detailed breakdown</b></summary>

        #### Spring Run Profiles

        - **Spring Run Profiles** activates specific profiles for the application with defined configurations. Profiles and their specified environment variables are defined in the [Song server application.yml](https://github.com/overture-stack/SONG/blob/develop/song-server/src/main/resources/application.yml). 

        | Profile       | Description                                                                                                                                                                                                 |
        |---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
        | `prod`        | Optimized for production use with minimal initialization and direct database connections.                                                                                                                                                   |
        | `secure`      | Focuses on security with OAuth2 JWTs for API protection. This profile calls for a public key location for JWT verification and an introspection URI for authenticating clients.                                                                   |
        | `kafka`       | Targets Kafka integration, specifying Kafka bootstrap servers and a default topic for message exchange. Does not include specific configurations for other services or security settings.                               |

        #### Flyway Variables

        - The `SPRING_FLYWAY_ENABLED` variable enables the initialization of the Song database with a Flyway database migration, setting up the necessary tables for API interactions. This migration utilizes SQL scripts located within Song and [found here](https://github.com/overture-stack/SONG/tree/develop/song-server/src/main/resources/db/migration). Without this setting, the database would remain uninitialized, leading to generic SQL errors (SQL Error: 0) with a SQLState of 42P01, corresponding to an undefined_table.

        #### Song Variables

        - The `ID_USELOCAL` mode indicates that Song will handle ID management internally, storing identifiers within its own system. Song can also be configured to use external ID management, for more information see our documentation for [ID management in Song](/).

        - By setting `SCHEMAS_ENFORCELATEST` to `true`, the Song server will enforce that data conforms to the latest schema versions. Conversely, if set to `false`, data can be submitted to any schema version specified with the metadata submission. For more information, see our [documentation on Song Schema Management](/).

        #### Score Variables

        - The `SCORE_URL` specifies the future URL of the Score service (`http://host.docker.internal:8087`).

        - The `SCORE_ACCESSTOKEN` is used by Song for authorized communication with Score. For example, during data publication Song will need to call Score to check if objects exist before publishing this access token, generated by Keycloak, encodes the permissions necessary to communicate securely.

        #### Keycloak Variables

        - `AUTH_SERVER_PROVIDER` specifies the authentication server provider, in this case, Keycloak.

        - `AUTH_SERVER_CLIENTID` the client ID assigned to the application by Keycloak. This identifier is used by the application to authenticate itself to the Keycloak server.

        - `AUTH_SERVER_CLIENTSECRET` the client secret associated with the client ID. This secret is used by the application to prove its identity to the Keycloak server.

        - `AUTH_SERVER_TOKENNAME`: the name of the token issued by Keycloak. This token is used by the application to authenticate subsequent requests to protected resources.

        - `AUTH_SERVER_KEYCLOAK_HOST` the URL where the Keycloak server is hosted.

        - `AUTH_SERVER_KEYCLOAK_REALM` the realm in Keycloak that contains the users and roles. The realm encapsulates the grouping of applications and users configured to Keycloak for this application.

        - `AUTH_SERVER_SCOPE_STUDY_PREFIX` the prefix added to the scope claim in the token. Scopes define the level of access granted to the token holder. In this case, it indicates a specific type of access related to studies.

        - `AUTH_SERVER_SCOPE_STUDY_SUFFIX` the suffix added to the scope claim in the token, further defining the level of access. Here, it specifies write access to study-related resources.

        - `AUTH_SERVER_SCOPE_SYSTEM` is the scope for system-level permissions, indicating write access to system resources managed by the application.

        - `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI` is the URL where the JSON Web Key Set (JWS) for the JWT tokens is located. This key set is used by the application to validate the signature of the JWT tokens issued by Keycloak.

        - `AUTH_SERVER_INTROSPECTIONURI` the URL used by the application to check the validity of a token against the Keycloak server. Introspection allows the application to verify that a token has not been revoked or expired.

        #### PostgreSQL connection details

        - `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` are the connection details for the PostgreSQL database. The value for the `SPRING_DATASOURCE_URL` needs to be appended with  `?stringtype=unspecified` (Song as it is coded requires string type to be unspecified to interact with JSONb columns).

        #### Kafka Variables

        - `SPRING_KAFKA_BOOTSTRAP-SERVERS` and `SPRING_KAFKA_TEMPLATE_DEFAULT-TOPIC` specifies the bootstrap servers and default topics for message publishing.

        #### Custom Swagger URL

        - `SWAGGER_ALTERNATEURL` specifies a custom URL for accessing the Swagger UI (`/swagger-ui`).

    </details>

2. **Run Song:** Use the docker run command with your `.env.song` file:

    ```bash
    docker run -d \
    --name song \
    --platform linux/amd64 \
    -p 8080:8080 \
    --env-file .env.song \
    ghcr.io/overture-stack/song-server:5.2.0
    ```

    Once running you should be able to access the Song Swagger UI from `http://localhost:8080/swagger-ui`

## Running Score

Score is a fault-tolerant multi-part parallel transfer service made to facilitate transfers of file data to and from object storage.      

1. **Create an env file:** Create a file named `.env.score` with the following content:

    ```bash
    # ==============================
    # Score Environment Variables
    # ==============================

    # Spring Variables
    SPRING_PROFILES_ACTIVE=default,collaboratory,prod,secure,jwt
    SERVER_PORT=8087
    # Song Variable
    METADATA_URL=http://song:8080
    # Score Variables
    SERVER_SSL_ENABLED="false"
    # Object Storage Variables
    S3_ENDPOINT=http://host.docker.internal:9000
    S3_ACCESSKEY=admin
    S3_SECRETKEY=admin123
    S3_SIGV4ENABLED=true
    S3_SECURED=false
    OBJECT_SENTINEL=heliograph
    BUCKET_NAME_OBJECT=object
    BUCKET_NAME_STATE=state
    UPLOAD_PARTSIZE=1073741824
    UPLOAD_CONNECTION_TIMEOUT=1200000
    # Keycloak Variables
    AUTH_SERVER_PROVIDER=keycloak
    AUTH_SERVER_CLIENTID=dms
    AUTH_SERVER_CLIENTSECRET=t016kqXfI648ORoIP5gepqCzqtsRjlcc
    AUTH_SERVER_TOKENNAME=apiKey
    AUTH_SERVER_KEYCLOAK_HOST=http://keycloak:8080
    AUTH_SERVER_KEYCLOAK_REALM=myrealm
    AUTH_SERVER_SCOPE_STUDY_PREFIX=STUDY.            
    AUTH_SERVER_SCOPE_DOWNLOAD_SUFFIX=.READ
    AUTH_SERVER_SCOPE_DOWNLOAD_SYSTEM=score.READ
    AUTH_SERVER_SCOPE_UPLOAD_SYSTEM=score.WRITE
    AUTH_SERVER_SCOPE_UPLOAD_SUFFIX=.WRITE
    AUTH_SERVER_URL=http://keycloak:8080/realms/myrealm/apikey/check_api_key/      
    AUTH_JWT_PUBLICKEYURL=http://keycloak:8080/oauth/token/public_key
    SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI=http://keycloak:8080/realms/myrealm/protocol/openid-connect/certs
    ```

    <details>
    <summary><b>Click here for a detailed breakdown</b></summary>

    #### Spring Run Profiles

    - **Spring Run Profiles** activates specific profiles for the application with defined configurations. Profiles and their specified environment variables are defined in the [Score server application.yml](https://github.com/overture-stack/score/blob/develop/score-server/src/main/resources/application.yml). The profiles used here are summarized below.

    | Profile       | Description                                                                                                                                                                                                 |
    |---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `collaboratory` | Configures the service for use with an S3 backend.                                             |
    | `prod`        | Optimizes the service for production use, enabling S3 security features and specifying the metadata server URL.                                                                                           |
    | `secure`      | Implements OAuth authentication, specifying the authentication server URL, token name, client ID, client secret, and scopes for download and upload operations.                                  |
    | `JWT`      |  The JWT (JSON Web Token) profile is used to configure the authentication method based on JWT. This profile includes settings to obtain the public key for token validation from an OAuth server.                             |

    #### Song & Score Variables

    - `SERVER_PORT` and `SERVER_SSL_ENABLED` specifies the port for the Score service (`8087`) and disables SSL (`false`), indicating HTTP communication. SSL is disabled to simplify deployment by avoiding the need to configure SSL certificates for HTTPS. This configuration should only be used in development environments and not in production.

    - `METADATA_URL` points to the URL for our previously deployed song-server at `http://song:8080`.

    #### Object Storage Variables

    - `S3_ENDPOINT`, `S3_ACCESSKEY`, `S3_SECRETKEY`, `BUCKET_NAME_OBJECT`, `BUCKET_NAME_STATE` defines access to object storage, including the endpoint (`minio:9001`), access key (`admin`), secret key (`admin123`), bucket names for objects (`object`) and state (`state`).

    - `UPLOAD_PARTSIZE` specifies the maximum size of individual parts when uploading large files to an object storage service. Large files are typically split into smaller parts to facilitate parallel uploads and to manage network bandwidth efficiently. If network bandwidth is limited, smaller part sizes might be beneficial to keep the upload process moving quickly. On the other hand, if the application requires high throughput and can afford to wait longer for uploads to complete, larger part sizes might be preferable.

    - `UPLOAD_CONNECTION_TIMEOUT` This variable sets the timeout duration for establishing a connection to the object storage service during the upload process. It is measured in milliseconds (ms). Adjusting the connection timeout allows for fine-tuning the application's tolerance for network latency and variability. 
        
    #### Keycloak Variables

    - **Authentication Configuration**: Specifies the authentication server provider (`Keycloak`), the Keycloak server's host (`http://keycloak:8080`), and the realm (`myrealm`) that contains the users and roles. This setup is crucial for securing applications by directing them to the correct Keycloak instance and realm for authentication and authorization processes.

    - **Token and Client Details**: Defines the token name (`apiKey`), client ID (`score`), and client secret (`scoresecret`) used for authentication. These elements are essential for establishing a secure connection between the application and the Keycloak server, ensuring that only authorized applications can access protected resources.

    - **Scope Definitions**: Outlines the scopes for study, download, and upload operations, specifying prefixes and suffixes that indicate the level of access granted to the token holder. These scopes are critical for defining the permissions associated with the tokens, controlling what actions can be performed by the authenticated users.

    - **Introspection and JWT Validation**: Provides the URL for checking the validity of a token (`http://keycloak:8080/realms/myrealm/apikey/check_api_key/`) and the location of the JSON Web Key Set (JWS) for validating JWT tokens (`http://keycloak:8080/realms/myrealm/protocol/openid-connect/certs`). These mechanisms ensure that tokens are valid and have not been tampered with, maintaining the security of the authentication process.

    </details>

2. **Run Score:** Use the docker run command with the `--env-file` option:

    ```bash
    docker run -d \
    --name score \
    --platform linux/amd64 \
    -p 8087:8087 \
    --env-file .env.score \
    ghcr.io/overture-stack/score-server:5.11.0
    ```

    Once running you should be able to access the Score Swagger UI from `http://localhost:8087/swagger-ui`
