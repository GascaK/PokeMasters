FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential cargo && rm -rf /var/lib/apt/lists/*

COPY db_server /app

RUN pip3 install --upgrade pip
RUN pip3 install -r /app/requirements.txt
CMD ["uvicorn", "--host", "0.0.0.0", "--port", "5000", "main:flask_asgi_app"]