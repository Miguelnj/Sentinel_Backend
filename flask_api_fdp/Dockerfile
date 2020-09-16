FROM python:3.8
RUN apt-get update && apt-get -y install cmake protobuf-compiler

COPY . /app

WORKDIR /app

ENTRYPOINT ["./entrypoint.sh"]

EXPOSE 5000