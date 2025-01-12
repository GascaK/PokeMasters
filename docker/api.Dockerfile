FROM python:latest


WORKDIR /app
COPY fast_server /app
COPY cache /app/cache
COPY dist /app/dist

RUN pip3 install -r /app/requirements.txt
CMD ["uvicorn","--host", "0.0.0.0", "--port", "8000", "main:subapp"]
