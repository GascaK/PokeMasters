FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential cargo && rm -rf /var/lib/apt/lists/*

COPY fast_server /app
COPY cache /app/cache
COPY dist /app/dist

RUN pip3 install --upgrade pip
RUN pip3 install -r /app/requirements.txt
CMD ["uvicorn","--host", "0.0.0.0", "--port", "80", "main:app"]
