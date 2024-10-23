# Evengod

## Instrucciones de deploy

Para el correcto deploy de la arquitectura de la aplicación se deberá ejecutar el comando `terraform init` seguido de `terraform apply` ambos en la carpeta raíz del directorio.

_Disclamer_: Notamos que en varios casos hace falta ejecutar **2 veces** el comando `terraform apply` (sin hacer modificaciones) para que la arquitectura termine de levantarse.

## Diagrama de arquitectura implementada

![Esquema de la arquitectura](resources/Arquitectura%20Cloud.png)

## Módulos, funciones y meta-argumentos utlizados

### Módulos

- **api-gateway**: Creación del API Gateway junto con una API REST que usamos para invocar a nuestras funciones lambda.

- **cognito**: Implementación del servicio de autenticación y autorización de usuarios Amazon Cognito.

- **lambdas**: Creación nuestra las funciones lambda que ejecutan la lógica de backend.

  - Consideración:
    - Las lambdas implementadas que se pueden ver en funcionamiento desde el front end son las siguientes:
    - `createEvent`, `createUser`, `createInscription`, `getCategories`, `getCategoryById`, `getEventById`, `getEventsByUserId`, `getEvents`, `getInscriptionById`, `getInscriptions`, `getUserById`, `getUsers`, `getEventImg`, `getUserImg`, `putEventImg`

- **rds**: Creación y configuración de una instancia RDS junto con un RDS proxy para comunicarse con las lambdas.

- **s3**: Creación de los buckets S3 para la págica estática del frontend y para el almacenamiento de imágenes de los eventos/usuarios.

- **security-groups**: Creación de los grupos de seguridad necesarios para controlar el tráfico entrante y saliente.

  - Consideración: Los security groups creados son los siguientes:
    - `Lambda-SG` → permite el tráfico entrante y saliente para el bucket S3 de las imágenes y solo el saliente hacia el security group del RDS proxy
    - `RDS-Proxy-SG` → permite el tráfico entrante desde las lambdas y el saliente hacia el security group del RDS
    - `MySQL-SG` → permite el tráfico entrante desde el security group del RDS proxy

- **subnet**: Configuración de subredes privadas dentro de nuestra VPC

- **vpc**: Creación de nuestra VPC y con todos los recursos necesarios (_subnets_ y _route tables_)

- **vpc-endpoint** (externo): Configuración de un VPC Endpoint para permitir la comunicación segura entre los servicios de nuestra VPC y nuestro bucket S3 de imágenes.

### Funciones

Algunas de las funciones utilizadas son:

- [**jsonencode**](https://github.com/AgusMattiussi/evengod-iac/blob/main/modules/rds/main.tf): usada para convertir las variables _username_ y _password_ en un json para generar el secret del RDS proxy.

- [**length**](https://github.com/AgusMattiussi/evengod-iac/blob/main/modules/vpc/main.tf): usada junto con count para generar N cantidad de subnets y route tables.

- [**fileset**](https://github.com/AgusMattiussi/evengod-iac/blob/main/main.tf): obtiene una lista de archivos del directorio de built para subirlos al bucket S3 de frontend.

- [**filemd5**](https://github.com/AgusMattiussi/evengod-iac/blob/main/main.tf): calcula el hash MD5 de cada archivo que subimos al bucket S3 de frontend.

- [**lookup**](https://github.com/AgusMattiussi/evengod-iac/blob/main/main.tf): busca el MIME type de los archivos que subimos al bucket S3 de frontend a partir de un mapa generado en [locals.tf](https://github.com/AgusMattiussi/evengod-iac/blob/main/locals.tf).

### Meta-argumentos

- [**depends-on**](https://github.com/AgusMattiussi/evengod-iac/blob/main/main.tf): usada para asegurarnos que la subida de archivos al bucket S3 de frontend sea ejecutada luego de ejecutar el script de build.

- [**for_each**](https://github.com/AgusMattiussi/evengod-iac/blob/main/main.tf): itera sobre cada archivo del conjunto de archivos generado por fileset para crear un objeto S3 por archivo.

- [**count**](https://github.com/AgusMattiussi/evengod-iac/blob/main/modules/vpc/main.tf): define cuantas subnets y route tables serán creadas a partir de una lista de CIDR blocks.

- [**lifecycle**](https://github.com/AgusMattiussi/evengod-iac/blob/main/modules/api-gateway/main.tf): controla el comportamiento de creación, actualización o destrucción de un recurso.

## Endpoints de la API

| Método | Endpoint             | Descripción                                  | Lambda conectada   |
| ------ | -------------------- | -------------------------------------------- | ------------------ |
| POST   | `/users`             | Crea un usuario                              | createUser         |
| GET    | `/users/{id}`        | Obtiene los detalles de un usuario por ID    | getUserById        |
| PUT    | `/users/{id}`        | Actualiza los detalles de un usuario         | editUser           |
| DELETE | `/users/{id}`        | Elimina un usuario                           | deleteUser         |
| GET    | `/users/{id}/events` | Obtiene eventos inscritos por usuario        | getEventsByUserId  |
| GET    | `/users/{id}/image`  | Obtiene la imagen de un usuario              | getuserImg         |
| PUT    | `/users/{id}/image`  | Actualiza la imagen de un usuario            | putUserImg         |
| GET    | `/events`            | Obtiene una lista de eventos                 | getEvents          |
| POST   | `/events`            | Crea un nuevo evento                         | createEvent        |
| GET    | `/events/{id}`       | Obtiene los detalles de un evento por ID     | getEventById       |
| PUT    | `/events/{id}`       | Actualiza los detalles de un evento          | editEvent          |
| GET    | `/events/{id}/image` | Obtiene la imagen de un evento               | getEventImg        |
| PUT    | `/events/{id}/image` | Actualiza la imagen de un evento             | putEventImg        |
| GET    | `/inscriptions`      | Obtiene una lista de inscripciones           | getInscriptions    |
| POST   | `/inscriptions`      | Crea una nueva inscripción                   | createInscription  |
| GET    | `/inscriptions/{id}` | Obtiene el detalle de una inscripción        | getInscriptionById |
| PUT    | `/inscriptions/{id}` | Edita el estado de una inscripción           | editInscription    |
| GET    | `/categories`        | Obtiene una lista de categorías              | getCategories      |
| GET    | `/categories/{id}`   | Obtiene los detalles de una categoría por ID | getCategoryById    |

## Rúbrica

<table>
    <tr>
        <th>Alumno</th>
        <th>Legajo</th>
        <th>Participación</th>
    </tr>
    <tr>
        <td>Valentin Yeli</td>
        <td>61011</td>
        <td>25%</td>
    </tr>
    <tr>
        <td>Nicolás Birsa</td>
        <td>61482</td>
        <td>25%</td>
    </tr>
    <tr>
        <td>Julián Sasso</td>
        <td>61535</td>
        <td>25%</td>
    </tr>
    <tr>
        <td>Agustín Mattiussi</td>
        <td>61361</td>
        <td>25%</td>
    </tr>
</table>
